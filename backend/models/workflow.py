#backend/models/workflow.py (MODIFIED)
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime 

# --- Base model for the database table (Requires user_id) ---
class WorkflowBase(SQLModel):
    name: str = Field(index=True)
    # user_id is REQUIRED in the DB model
    user_id: int = Field(foreign_key="user.id", index=True)    
    # Custom Trigger Points
    trigger_subject: str = Field(default="Daily Sales Report") 
    trigger_sender: Optional[str] = None 
    recheck_interval_minutes: int = Field(default=60) # How often to run the job (in minutes)
    target_table: str = Field(default="fact_orders") 
    is_active: bool = Field(default=True)

class Workflow(WorkflowBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    last_run_status: Optional[str] = Field(default=None) 
    last_run_timestamp: Optional[datetime] = Field(default=None)
    last_processed_email_id: Optional[str] = Field(default=None)

# --- Pydantic model for the incoming POST request payload (Excludes user_id) ---
class WorkflowCreate(SQLModel):
    name: str
    trigger_subject: str = Field(default="Daily Sales Report") 
    trigger_sender: Optional[str] = None 
    target_table: str = Field(default="fact_orders") 
    is_active: bool = Field(default=True)
    # CRITICAL ADDITION: Must match the data model structure
    recheck_interval_minutes: Optional[int] = Field(default=60) # <<< MODIFIED
# --- Pydantic model for the PATCH request payload ---
class WorkflowUpdate(SQLModel):
    name: Optional[str] = None
    trigger_subject: Optional[str] = None
    trigger_sender: Optional[str] = None 
    is_active: Optional[bool] = None 
    recheck_interval_minutes: Optional[int] = None

# --- Pydantic model for the response output ---
class WorkflowRead(WorkflowBase):
    id: int
    last_run_status: Optional[str]
    last_run_timestamp: Optional[datetime]