# backend/services/ingestion.py
import pandas as pd
from sqlmodel import Session, select, SQLModel

# Import the model for the table we are targeting
from models.sales_data_model import SalesData 
from database import get_session # Dependency to get a DB session


def ingest_data_frame(df: pd.DataFrame, session: Session) -> int:
    """
    Takes a cleaned Pandas DataFrame and loads it into the SalesData table.
    
    Args:
        df: The cleaned data from the data_processor.
        session: The active SQLModel database session.
        
    Returns:
        The total number of rows successfully inserted.
    """
    
    # Placeholder Merchant ID (In a real app, this comes from the current_user)
    # Since auth works, we can assume a fixed ID for now.
    MOCK_MERCHANT_ID = 1 
    
    inserted_count = 0
    
    # 1. Prepare data for SQLModel (list of dictionaries)
    # Ensure column names in the DataFrame match the model attributes exactly
    data_records = df.to_dict(orient='records')
    
    for record in data_records:
        try:
            # 2. Add fixed merchant_id and validate against the SalesData model
            record['merchant_id'] = MOCK_MERCHANT_ID
            
            # NOTE: SQLModel's .model_validate() will perform Pydantic validation 
            # (e.g., date formats, integer types) ensuring clean data.
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