# backend/services/ingestion.py
import pandas as pd
from sqlmodel import Session, select, SQLModel
from database import get_session 

from models.sales_data_model import SalesData 


# NOTE: merchant_id: int ADDED to the signature
def ingest_data_frame(df: pd.DataFrame, session: Session, merchant_id: int) -> int:
    """
    Takes a cleaned Pandas DataFrame and loads it into the SalesData table.
    
    Args:
        df: The cleaned data from the data_processor.
        session: The active SQLModel database session.
        merchant_id: The ID of the merchant (user) who owns the data. <-- NEW
        
    Returns:
        The total number of rows successfully inserted.
    """
    
    inserted_count = 0
    
    # 1. Prepare data for SQLModel (list of dictionaries)
    data_records = df.to_dict(orient='records')
    
    for record in data_records:
        try:
            # 2. Add the correct, dynamic merchant_id
            record['merchant_id'] = merchant_id
            
            sales_record = SalesData.model_validate(record)
            
            # 3. Add to session (This is simplified for INSERT. For UPSERT, more logic is needed)
            session.add(sales_record)
            inserted_count += 1
            
        except Exception as e:
            # Log the problematic row and continue (for robustness)
            print(f"Skipping bad record during ingestion: {e}. Data: {record}")
            
    # 4. Commit all records in one transaction
    session.commit()
    
    return inserted_count