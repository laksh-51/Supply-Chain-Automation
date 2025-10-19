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