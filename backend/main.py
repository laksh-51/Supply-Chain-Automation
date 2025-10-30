# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from passlib.context import CryptContext
from typing import Annotated, List
from models.sales_data_model import SalesData # Need to import the SalesData model
from sqlmodel import SQLModel
from datetime import datetime # ADDED: Need this for timestamp updatesfrom datetime import datetime # ADDED: Need this for timestamp updates
from apscheduler.schedulers.asyncio import AsyncIOScheduler # <<< NEW IMPORT
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore # New import
from apscheduler.jobstores.base import JobLookupError # NEW IMPORT
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
# Import the Workflow model
from models.workflow import Workflow # ADDED
# Import the new router
from routers import workflows # ADDED: Assuming an empty __init__.py exists in routers/
# Imports needed for SQL translation metadata
from models.sales_data_model import SalesData 
from models.sales_data_model import get_sales_data_model # NEW IMPORT
from sqlmodel import inspect
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError



# The split(',') creates a list of strings: ["http://localhost:5173", "http://127.0.0.1:5173"]
origins_str = os.getenv("FRONTEND_URLS", "http://localhost:5173").split(',')
# origins = [origin.strip() for origin in origins_str]
origins = ["*"] # <<< CHANGE THIS LINE
print(f"DEBUG: CORS Allowed Origins: {origins}") 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # This should now definitively contain http://localhost:5173
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
app.include_router(workflows.router) # ADD THIS LINE to register the new router


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
# --- NEW SCHEDULER SETUP ---
scheduler = AsyncIOScheduler()
# ---------------------------

# NEW FUNCTION: The core scheduled task
def scheduled_workflow_check(workflow_id: int):
    """Checks all active workflows and triggers ETL if a new email is detected."""
    with next(get_session()) as session:
        # 1. Fetch workflow and dynamic model
       workflow = session.get(Workflow, workflow_id) # <<< FIX: Uses passed ID
    if not workflow or not workflow.is_active:
            print(f"SCHEDULER: Job failed. Workflow ID {workflow_id} not found or inactive.")
            return

    SalesDataModel = get_sales_data_model(workflow_id) 
        
        # CRITICAL: Ensure the table exists before use (Multitenancy safety)
    SalesDataModel.metadata.create_all(session.get_bind())
        
    print(f"SCHEDULER: Checking workflow ID {workflow_id}: {workflow.name}")
            # --- Build Search Query ---
    search_query = f"subject:{workflow.trigger_subject}"
    if workflow.trigger_sender:
                search_query += f" from:{workflow.trigger_sender}"
            
            # --- Find New Attachment ---
            # NOTE: We now expect 3 return values
    raw_data, file_name, message_id = find_and_download_attachment(search_query=search_query)

    if raw_data is None or message_id is None:
                # Log INFO if no new email found, but don't halt the scheduler
                new_log = WorkflowLog(
                    merchant_id=workflow.user_id, 
                    status="INFO",
                    workflow_id=workflow.id,
                    message=f"No email found matching '{search_query}'. Skipping."
                )
                session.add(new_log)
                session.commit() # Commit the INFO log immediately
    return# Skip to next workflow  # noqa: F702

            # --- IDEMPOTENCY CHECK ---
    if workflow.last_processed_email_id == message_id:
                print(f"SCHEDULER: Workflow {workflow.id} skipped. Email already processed.")
    return # Skip to next workflow
            
            # --- ETL Logic (Same as manual trigger) ---
    df = process_attachment_data(raw_data, file_name)
    if df is None or df.empty:
                 # Log FAILURE and continue
                 print(f"SCHEDULER: ERROR - Data processing failed for workflow {workflow.id}.")
                 return
                 
    rows_inserted = ingest_data_frame(df, session) 
            
            # --- Update Log and Workflow Status/ID ---
    new_log = WorkflowLog(
                merchant_id=workflow.user_id, 
                status="SUCCESS",
                workflow_id=workflow.id,
                source_filename=file_name,
                rows_inserted=rows_inserted,
                message=f"Ingestion successful. Processed {df.shape[0]} rows."
            )
    session.add(new_log)
            
            # UPDATE WORKFLOW STATE
    workflow.last_run_status = "AUTO-SUCCESS"
    workflow.last_run_timestamp = datetime.utcnow()
    workflow.last_processed_email_id = message_id # <<< CRUCIAL IDEMPOTENCY UPDATE
    session.add(workflow)
    session.commit()
    print(f"SCHEDULER: Workflow {workflow.id} SUCCESS: {rows_inserted} rows inserted.")

# Job store setup using your PostgreSQL database
jobstores = {
    'default': SQLAlchemyJobStore(url=os.getenv("DATABASE_URL"))
}
scheduler = AsyncIOScheduler(jobstores=jobstores)

# Core ETL logic (Now called by the scheduler for a SINGLE workflow)
def run_etl_for_workflow(workflow_id: int):
    """Core ETL logic for a single workflow instance."""
    with next(get_session()) as session:
        workflow = session.get(Workflow, workflow_id)
        if not workflow or not workflow.is_active:
            # Safely remove job if workflow is deleted/inactive
            scheduler.remove_job(str(workflow_id))
            return
        
        # ... logic to build search_query ...
        # ... logic for find_and_download_attachment (returns 3 values) ...
        # ... Idempotency Check (last_processed_email_id) ...
        # ... ETL & Ingestion (PASSING user_id and workflow_id) ...
        # ... Log success, Update workflow.last_processed_email_id, session.commit() ...

# NEW HELPER: Job creation/update logic
def create_dynamic_job(workflow: Workflow):
    """Adds or updates a job for a single workflow based on its interval."""
    # Job ID must be unique (use f"wf_{user_id}_{workflow_id}")
    job_id = f"wf_{workflow.user_id}_{workflow.id}"
    
    # If interval is 0 or less, skip/remove job
    if workflow.recheck_interval_minutes < 1:
        try:
            scheduler.remove_job(job_id)
            print(f"SCHEDULER: Removed job {job_id}. Interval is invalid.")
        except JobLookupError:
            pass # Job didn't exist anyway
        return

    try:
        # Try to remove any existing job with this ID first
        scheduler.remove_job(job_id)
    except JobLookupError:
        pass
        
    # Add the new job
    scheduler.add_job(
        scheduled_workflow_check, # The existing function that checks one workflow's email
        'interval', 
        minutes=workflow.recheck_interval_minutes, 
        id=job_id,
        name=workflow.name,
        # Pass the specific workflow ID as an argument
        kwargs={'workflow_id': workflow.id}
    )
    print(f"SCHEDULER: Scheduled job {job_id} for every {workflow.recheck_interval_minutes} minutes.")
    
# NEW: Scheduler Management Function
def manage_workflow_jobs():
    """Runs periodically to synchronize database workflows with scheduler jobs."""
    with next(get_session()) as session:
        workflow = session.get(Workflow, workflow_id)
        if not workflow or not workflow.is_active:
            return
        
        for workflow in active_workflows:
            job_id = str(workflow.id)
            # Use the custom interval from the database
            interval = workflow.recheck_interval_minutes 
            
            if job_id not in existing_job_ids:
                # Add new job
                scheduler.add_job(
                    run_etl_for_workflow, 
                    'interval', 
                    minutes=interval, 
                    id=job_id, 
                    args=[workflow.id]
                )
            else:
                # Update existing job if interval changed
                job = scheduler.get_job(job_id)
                # Check if the job's set interval differs from the database interval
                if job and (job.trigger.interval.total_seconds() / 60) != interval:
                    job.reschedule(trigger='interval', minutes=interval)

        # Logic to remove jobs for deleted/inactive workflows (Crucial for cleanup)
        for job in existing_jobs:
            if job.id != 'workflow_manager_job':
                if not session.get(Workflow, int(job.id)):
                    scheduler.remove_job(job.id)
                    
def job_manager():
    """Runs periodically to update/create jobs for all active workflows."""
    with next(get_session()) as session:
        active_workflows = session.exec(select(Workflow).where(Workflow.is_active == True)).all()
        for workflow in active_workflows:
            create_dynamic_job(workflow)                    
            
@app.on_event("startup")
def on_startup():
    """Creates database tables and starts the scheduler."""
    create_db_and_tables()
    
    scheduler.start()
    
    # Start the manager job that runs less frequently to check for new workflows
    scheduler.add_job(job_manager, 'interval', minutes=5, id='workflow_manager', replace_existing=True)
    print("SCHEDULER: Manager job started, running every 5 minutes to manage individual workflow jobs.")
    
@app.on_event("shutdown")
def on_shutdown():
    """Stops the scheduler when the application shuts down."""
    if scheduler.running:
        scheduler.shutdown()
        print("SCHEDULER: Shutdown complete.")
                  
@app.post("/api/v1/trigger-workflow/{workflow_id}") # MODIFIED PATH
async def trigger_data_ingestion(
    workflow_id: int, # ADDED
    current_user: User = Depends(get_current_active_user), 
    session: Session = Depends(get_session) 
):
    """
    Triggers the ETL pipeline using the specified workflow configuration.
    """
    # 1. Fetch and Validate Workflow (Ensure user owns it)
    workflow = session.exec(
        select(Workflow).where(
            (Workflow.id == workflow_id) & (Workflow.user_id == current_user.id)
        )
    ).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Workflow not found or access denied."
        )

    # 2. Use workflow filters for Gmail search
    search_query = f"subject:{workflow.trigger_subject}"
    if workflow.trigger_sender:
        search_query += f" from:{workflow.trigger_sender}"
        
    #
    raw_data, file_name, _ = find_and_download_attachment(search_query=search_query) # <<< FIXED UNPACKING

    if raw_data is None:
        # Check for service failure (same logic as before)
        if not os.path.exists(TOKEN_FILE_PATH): 
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gmail Service failed to authenticate. Run Gmail Monitor script manually or check 'credentials.json' existence and path."
            )
             
        # Log INFO to History Model (No email found)
        new_log = WorkflowLog(
            merchant_id=current_user.id, 
            status="INFO",
            workflow_id=workflow.id, # Link log to workflow
            message=f"No email found matching '{search_query}'. Skipping ingestion."
        )
        session.add(new_log)
        # Update workflow status
        workflow.last_run_status = "INFO: No Email"
        workflow.last_run_timestamp = datetime.utcnow() #
        session.add(workflow)
        session.commit()
        return {"status": "info", "message": f"Workflow '{workflow.name}' skipped. No new email."}

    # 3. Process/Extract Data into DataFrame
    df = process_attachment_data(raw_data, file_name)

    if df is None or df.empty: #
        # Handle logging for failure if needed...
        raise HTTPException(status_code=400, detail="Data processing failed or attachment was empty.")
        raise HTTPException(status_code=501, detail="Manual trigger disabled. Use scheduler or implement full idempotency logic here.")

    # 4. Ingestion (Load)
    rows_inserted = ingest_data_frame(df, session) 

    # 5. Log Success to History and Update Workflow Status
    new_log = WorkflowLog(
        merchant_id=current_user.id, 
        status="SUCCESS",
        workflow_id=workflow.id, # Link log to workflow
        source_filename=file_name,
        rows_inserted=rows_inserted,
        message=f"Ingestion successful. Processed {df.shape[0]} rows."
    )
    session.add(new_log)
    
    # Update workflow status
    workflow.last_run_status = "SUCCESS"
    workflow.last_run_timestamp = datetime.utcnow()
    session.add(workflow) 
    session.commit() # Commit all changes (log and workflow update)

    # 6. Return summary
    return {
        "status": "success",
        "message": f"Workflow '{workflow.name}' executed. Data from {file_name} loaded.",
        "rows_processed": df.shape[0],
        "rows_inserted": rows_inserted
    }

# NEW ENDPOINT: Get History for the current user
@app.get("/api/v1/history", response_model=List[WorkflowLog])
def get_user_history(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Retrieves the last 5 relevant activity logs for the current user."""
    logs = session.exec(
        select(WorkflowLog)
        .where(WorkflowLog.merchant_id == current_user.id)
        .order_by(WorkflowLog.timestamp.desc())
        .limit(5)
    ).all()
    
    return logs
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
    system_instruction = (
        "You are a helpful, friendly, and professional AI assistant for a Supply Chain Automation platform. "
        "Your primary function is to answer questions strictly about *how to use the system, its features, and basic supply chain terminology*. "
        "Do not answer general knowledge questions. Keep answers concise."
    )    
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                {"role": "system", "parts": [{"text": system_instruction}]}, # Pass system instruction first
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
        result = session.exec(select(SalesData).where(SalesData.merchant_id == current_user.id)).all()
        
        if not raw_sql.upper().startswith("SELECT"):
            raise HTTPException(status_code=400, detail="Invalid query type.")
        
        result = session.exec(raw_sql).all() # This needs a workflow ID passed in the query
        # Since the result structure can vary, we convert to a list of dicts for JSON
        return {
            "status": "success",
            "query": raw_sql,
            "results": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database execution failed: {e}")

@app.get("/api/v1/data/raw/{workflow_id}", response_model=List[SalesData])
def get_raw_sales_data(
    workflow_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
   # 1. Fetch model and create table if missing (optional safety check)
    SalesDataModel = get_sales_data_model(workflow_id)
    SalesDataModel.metadata.create_all(session.get_bind())

    # 2. Query data using the dynamic model
    data = session.exec(select(SalesDataModel)).all()
    # Pydantic/FastAPI will automatically serialize the list of DynamicSalesData objects
    return data

    
@app.get("/")
def read_root():
    return {"message": "Supply Chain Automation Backend Running"}

