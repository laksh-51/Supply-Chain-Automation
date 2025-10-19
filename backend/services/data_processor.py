# backend/services/data_processor.py
import pandas as pd
import io
import os


def create_dummy_dataframe():
    """Creates a sample DataFrame for initial testing."""
    data = {
        'order_id': ['ORD001', 'ORD002', 'ORD003'],
        'product_id': ['PROD_A', 'PROD_B', 'PROD_A'],
        'customer_id': ['CUST_X', 'CUST_Y', 'CUST_X'],
        'order_qty': [100, 50, 25],
        'delivery_qty': [100, 48, 25],
        'delivery_date': ['2025-10-14', '2025-10-14', '2025-10-13'],
        'on_time': [1, 0, 1], # 1 = On Time, 0 = Late
        'in_full': [1, 0, 1]  # 1 = In Full, 0 = Short
    }
    return pd.DataFrame(data)


def process_attachment_data(raw_data: bytes, file_name: str):
    """
    Reads raw attachment data (Excel/CSV) into a Pandas DataFrame,
    performing initial validation/cleaning.
    """
    if not raw_data:
        print("INFO: No raw file provided. Using dummy data for ingestion test.")
        df = create_dummy_dataframe()
        # Ensure dummy data columns are standardized (though they should be)
        df.columns = df.columns.str.lower().str.replace(' ', '_')
        return df
        
        
    # Determine file type based on extension
    file_extension = os.path.splitext(file_name)[1].lower()

    try:
        data_io = io.BytesIO(raw_data)
        
        if file_extension in ['.xlsx', '.xls']:
            df = pd.read_excel(data_io)
        elif file_extension == '.csv':
            # Use appropriate encoding if needed, or stick to utf-8 default
            df = pd.read_csv(data_io)
        else:
            print(f"ERROR: Unsupported file type: {file_extension}")
            return None
            
        # --- Data Cleaning and Transformation (T in ETL) ---
        
        # 1. Standardize/Rename columns (CRUCIAL step for ingestion)
        df.columns = df.columns.str.lower().str.replace(' ', '_')
        
        # 2. Basic Type Conversion (Ensure date and integer fields are correct)
        # Assuming your attachment has columns like 'delivery_date', 'order_qty', 'revenue'
        # NOTE: You MUST tailor these column names to your actual incoming files.
        if 'delivery_date' in df.columns:
            df['delivery_date'] = pd.to_datetime(df['delivery_date'], errors='coerce')
        if 'order_qty' in df.columns:
            df['order_qty'] = df['order_qty'].fillna(0).astype(int)

        # 3. Drop rows with critical missing data (simple validation)
        df = df.dropna(subset=['order_id', 'product_id'])

        print(f"SUCCESS: Data loaded into DataFrame. Shape: {df.shape}")
        return df
        
    except Exception as e:
        print(f"ERROR: Failed to process data file: {e}")
        return None