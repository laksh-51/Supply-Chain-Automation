# History Model
from datetime import datetime

class HistoryBase(SQLModel):
    workflow_id: int = Field(foreign_key="workflow.id", index=True) # Links to the workflow
    user_id: str = Field(foreign_key="user.id", index=True)
    
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    activity_type: str = Field(max_length=50) # e.g., "Run Success", "Config Update", "Run Failure"
    summary_message: str # Brief description of what happened

class History(HistoryBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)