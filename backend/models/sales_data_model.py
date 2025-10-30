# backend/models/sales_data_model.py
from sqlmodel import Field, SQLModel
from datetime import date
from typing import Optional


class SalesData(SQLModel, table=True):
    # Primary key and relationship to the merchant (optional for now)
    id: Optional[int] = Field(default=None, primary_key=True)
    merchant_id: int = Field(index=True)

    # Core supply chain fields - assume these come from the email attachment
    order_id: str
    product_id: str
    customer_id: str
    order_qty: int
    delivery_qty: int
    delivery_date: date
    on_time: int # 1 if on time, 0 otherwise
    in_full: int # 1 if in full, 0 otherwise
    # Will expand on this later
    
def get_sales_data_model(workflow_id: int):
    """Returns a unique SQLModel class mapped to the specific workflow table."""
    table_name = f"sales_data_{workflow_id}"
    
    # Use type() to dynamically create a new class inheriting from SalesDataCore
    DynamicSalesData = type(
        'SalesData', 
        (SalesDataCore,), 
        {'__tablename__': table_name, '__table_args__': {'extend_existing': True}}
    )
    # Re-declare the base for SQLModel magic to recognize the table
    # DynamicSalesData.metadata = SQLModel.metadata # Use global metadata
    
    return DynamicSalesData    