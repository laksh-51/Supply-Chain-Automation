# backend/models/log_model.py
from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional

class WorkflowLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    merchant_id: int = Field(index=True, nullable=False)
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    status: str # E.g., 'SUCCESS', 'FAILURE', 'INFO'
    source_filename: Optional[str] = None
    rows_inserted: int = Field(default=0)
    message: str