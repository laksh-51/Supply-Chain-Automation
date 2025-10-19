import pandas as pd
from sqlmodel import Session
from database import engine 
from services.ingestion import ingest_data_frame
from services.data_processor import create_dummy_dataframe


# 1. Create Data
df_test = create_dummy_dataframe()

# 2. Start a Manual Session and Execute Ingestion
with Session(engine) as session:
    print("--- Attempting Ingestion ---")
    try:
        # Note: ingest_data_frame requires session as an argument
        rows = ingest_data_frame(df_test, session) 
        # Manual commit is crucial for shell testing
        session.commit()
        print(f"SUCCESS: {rows} rows committed. Check DB now.")
    except Exception as e:
        # This will print the explicit SQLModel or DB error
        print(f"FATAL INGESTION ERROR: {e}") 
        session.rollback() 
        print("TRANSACTION ROLLED BACK.")