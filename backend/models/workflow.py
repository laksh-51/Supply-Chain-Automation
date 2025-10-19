# In your FastAPI project (e.g., main.py or models/workflow.py)
from typing import Optional
from sqlmodel import SQLModel, Field

class WorkflowBase(SQLModel):
    name: str = Field(index=True) # User-defined name (e.g., "Client X Daily Sales")
    user_id: str = Field(foreign_key="user.id", index=True) # Links to the current user
    
    # Custom Trigger Points (e.g., subject line filter, sender email)
    trigger_subject: str = Field(default="daily sales") 
    trigger_sender: Optional[str] = None 
    
    # Database Configuration (which internal table to target/update)
    target_table: str = Field(default="fact_orders") 
    is_active: bool = Field(default=True)

class Workflow(WorkflowBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class WorkflowRead(WorkflowBase):
    id: int