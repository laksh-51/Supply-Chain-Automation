# backend/models/sales_data_model.py
from sqlmodel import Field, SQLModel
from datetime import date
from typing import Optional, ClassVar 


# 1. Define Mixin (inherits from SQLModel for Pydantic features)
class SalesDataMixin(SQLModel):
    # Core supply chain fields - schema blueprint
    order_id: str
    product_id: str
    customer_id: str
    order_qty: int
    delivery_qty: int
    delivery_date: date
    on_time: int # 1 if on time, 0 otherwise
    in_full: int # 1 if in full, 0 otherwise

# 2. Define Base Table (for compatibility with existing code)
class SalesData(SalesDataMixin, table=True):
    # Define primary key and mandatory foreign key fields here
    id: Optional[int] = Field(default=None, primary_key=True)
    merchant_id: int = Field(index=True)
    
def get_sales_data_model(workflow_id: int):
    """Returns a unique SQLModel class mapped to the specific workflow table."""
    table_name = f"sales_data_{workflow_id}"
    
    # CRITICAL FIX: Define the class dynamically using standard Python class syntax 
    # inside the function. This correctly triggers SQLModel's metaclass logic.
    class DynamicSalesData(SalesDataMixin, table=True):
        __tablename__ = table_name
        __table_args__ = {'extend_existing': True}
        
        # Explicitly re-declare the fields required for ORM mapping/table creation
        id: Optional[int] = Field(default=None, primary_key=True)
        merchant_id: int = Field(index=True)

    # Overwrite the name to be unique (optional, but good practice)
    DynamicSalesData.__name__ = f'SalesData_{workflow_id}'
    DynamicSalesData.__qualname__ = DynamicSalesData.__name__
    
    return DynamicSalesData