# backend/services/ingestion.py
import pandas as pd
from sqlmodel import Session, select, SQLModel
from typing import Type # <--- CRITICAL: Must be imported
from database import get_session 


# REMOVE THIS LINE: from models.sales_data_model import SalesData 


# CRITICAL FIX: The function must explicitly accept 4 arguments
def ingest_data_frame(df: pd.DataFrame, session: Session, merchant_id: int, SalesDataModel: Type) -> int:
    """
    Takes a cleaned Pandas DataFrame and loads it into the correct sales data table.
    
    Args:
        df: The cleaned data from the data_processor.
        session: The active SQLModel database session.
        merchant_id: The ID of the merchant (user) who owns the data.
        SalesDataModel: The dynamic SQLModel class (e.g., SalesData_1) for insertion. <--- NEW
        
    Returns:
        The total number of rows successfully inserted.
    """
    
    inserted_count = 0
    data_records = df.to_dict(orient='records')
    
    for record in data_records:
        try:
            record['merchant_id'] = merchant_id
            
            # Use the passed-in SalesDataModel for validation/mapping
            sales_record = SalesDataModel.model_validate(record) 
            
            session.add(sales_record)
            inserted_count += 1
            
        except Exception as e:
            print(f"Skipping bad record during ingestion: {e}. Data: {record}")
            
    session.commit()
    return inserted_count