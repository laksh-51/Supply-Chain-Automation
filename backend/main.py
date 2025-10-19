# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from passlib.context import CryptContext
from typing import Annotated
from sqlmodel import SQLModel

import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

from database import create_db_and_tables, get_session
from models.user_model import User, UserCreate, UserLogin, Token 
from models.sales_data_model import SalesData 
from services.auth_utils import create_access_token, verify_password, get_password_hash, get_current_active_user  
from services.gmail_monitor import find_and_download_attachment, TOKEN_FILE_PATH
from services.data_processor import process_attachment_data
from services.ingestion import ingest_data_frame
from models.log_model import WorkflowLog
from analytics.kpi_calculator import get_all_kpis 
from analytics.anomaly_detector import detect_anomalies
from services.llm_translator import generate_insight_summary, translate_natural_language_to_sql

# Imports needed for SQL translation metadata
from models.sales_data_model import SalesData 
from sqlmodel import inspect
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError



# The split(',') creates a list of strings: ["http://localhost:5173", "http://127.0.0.1:5173"]
origins = os.getenv("FRONTEND_URLS").split(',')
print(f"DEBUG: CORS Allowed Origins: {origins}") 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # This is the critical line that allows 5173 to access 8000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Startup Event ---
@app.on_event("startup")
def on_startup():
    """Creates database tables when the application starts."""
    create_db_and_tables()

# --- Authentication Routes ---

@app.post("/api/v1/register", response_model=User)
def register_user(user_data: UserCreate, session: Session = Depends(get_session)):
    # 1. Check if user already exists
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # 2. Hash Password
    hashed_password = get_password_hash(user_data.password)

    # 3. Create new user model instance
    db_user = User(
        email=user_data.email, 
        full_name=user_data.full_name, 
        hashed_password=hashed_password
    )

    # 4. Save to DB
    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user

@app.post("/api/v1/login", response_model=Token)
def login_for_access_token(user_data: UserLogin, session: Session = Depends(get_session)):
    # 1. Authenticate User
    user = session.exec(select(User).where(User.email == user_data.email)).first()

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Create JWT Token
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
    )
    return {"access_token": access_token, "token_type": "bearer"}

# backend/main.py (Update the function definition and body)

@app.post("/api/v1/trigger-workflow/")
async def trigger_data_ingestion(
    current_user: str = Depends(get_current_active_user), # Use current_user for authorization
    session: Session = Depends(get_session) # <-- NEW: Add DB Session Dependency
):
    """
    Triggers the ETL pipeline: Checks Gmail, downloads attachment, extracts, and loads data.
    """

    search_query = f"subject:{os.getenv('EMAIL_TRIGGER_KEYWORD')}"
    raw_data, file_name = find_and_download_attachment(search_query=search_query)

    if raw_data is None:
        # Check if token.json is missing, which would cause the error flow below
        if not os.path.exists(TOKEN_FILE_PATH):
             # This is a safe guard, but shouldn't be hit now that token.json exists.
             # If you want to check for token.json path again, you need to import it
             pass 

        return {"status": "info", "message": "No new email found matching the trigger criteria. Skipping ingestion."}

    # 1. Process/Extract Data into DataFrame
    df = process_attachment_data(raw_data, file_name)

    if df is None or df.empty:
        raise HTTPException(status_code=400, detail="Data processing failed or attachment was empty.")

    # 2. Ingestion (Load)
    rows_inserted = ingest_data_frame(df, session) # Pass DataFrame and session

    new_log = WorkflowLog(
    merchant_id=current_user.id, # Use the actual user ID from the token
    status="SUCCESS",
    source_filename=file_name,
    rows_inserted=rows_inserted,
    message=f"Ingestion successful. Processed {df.shape[0]} rows."
    )
    session.add(new_log)
    session.commit()

    # 4. Return summary
    return {
    "status": "success",
    "message": f"Workflow executed. Data from {file_name} loaded.",
    "rows_processed": df.shape[0],
    "rows_inserted": rows_inserted
}
    # 3. Return summary
    return {
        "status": "success",
        "message": f"Workflow executed. Data from {file_name} loaded.",
        "rows_processed": df.shape[0],
        "rows_inserted": rows_inserted
    }
# backend/main.py (Add the new route below trigger_data_ingestion)

@app.get("/api/v1/insights")
def get_insights(
    current_user: str = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Retrieves all calculated KPIs and runs anomaly detection.
    """
    # 1. Calculate all KPIs from the current database state
    kpis = get_all_kpis(session)

    # 2. Run Anomaly Detection
    anomaly_result = detect_anomalies(kpis)

    ai_summary = generate_insight_summary(anomaly_result)
    # 3. Compile final response structure

    return {
        "status": "success",
        "kpis": kpis,
        "anomaly": anomaly_result,
        "ai_summary_text": ai_summary # <-- NEW FIELD
    }
# --- Placeholder Root Route ---
# backend/main.py (Add the new route below existing routes)
class ChatInput(SQLModel):
    message: str

# NOTE: This endpoint uses a general prompt and does NOT access the DB.
@app.post("/api/v1/chatbot")
def chat_with_gemini(
    data: ChatInput,
    current_user: str = Depends(get_current_active_user),
):
    """
    Handles general chat queries using the Gemini API.
    """
    from services.llm_translator import client, APIError # Import client directly
    
    if not client:
        return {"response": "Chatbot Service Offline: Missing API Key."}

    # System instruction for tone and context
    system_instruction = "You are a helpful, professional, and friendly AI assistant for a Supply Chain Automation platform. Keep answers concise."
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                {"role": "user", "parts": [{"text": system_instruction}]},
                {"role": "user", "parts": [{"text": data.message}]}
            ]
        )
        return {"response": response.text.strip()}
    except APIError:
        return {"response": "Sorry, I encountered an API error while processing your request."}
# Pydantic model for user input
class QueryInput(SQLModel):
    query: str

# Helper function to get schema for the LLM
def get_sales_schema_for_llm():
    mapper = inspect(SalesData)
    schema = []
    for column in mapper.columns:
        # Simple list of name and type for LLM context
        schema.append({
            "name": column.key,
            "type": str(column.type).split("(")[0] 
        })
    return schema

@app.post("/api/v1/query-data")
def get_query_data(
    data: QueryInput,
    current_user: str = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Translates a natural language query to SQL, executes it, and returns results.
    """
    # 1. Get Schema Context
    sales_schema = get_sales_schema_for_llm()

    # 2. Translate Query (LLM call)
    raw_sql = translate_natural_language_to_sql(data.query, sales_schema)

    # Safety Check: Ensure the query is a SELECT statement (Security!)
    if not raw_sql.upper().startswith("SELECT"):
        raise HTTPException(status_code=400, detail="Invalid query type. Only SELECT statements are allowed.")

    # 3. Execute Translated Query
    try:
        # Execute raw SQL, fetch all results
        result = session.exec(raw_sql).all()

        # Since the result structure can vary, we convert to a list of dicts for JSON
        return {
            "status": "success",
            "query": raw_sql,
            "results": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database execution failed: {e}")
    
@app.get("/")
def read_root():
    return {"message": "Supply Chain Automation Backend Running"}

