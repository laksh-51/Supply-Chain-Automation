from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional

# Import models and dependencies
from database import get_session 
from models.workflow import Workflow, WorkflowCreate, WorkflowRead, WorkflowUpdate
from models.user_model import User
from services.auth_utils import get_current_active_user
from models.sales_data_model import get_sales_data_model # NEW IMPORT
import main # <<< MODIFIED: Simple direct import of main.py

router = APIRouter(prefix="/api/v1", tags=["workflows"])

# --- Helper Dependency for Authorization ---
def get_user_workflow(workflow_id: int, user: User, session: Session):
    workflow = session.exec(
        select(Workflow).where(
            (Workflow.id == workflow_id) & (Workflow.user_id == user.id)
        )
    ).first()
    
    if not workflow:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found or access denied.")
    return workflow

# --- CRUD Endpoints ---

@router.get("/workflows", response_model=List[WorkflowRead])
def read_workflows(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """List all workflows for the current user."""
    workflows = session.exec(
        select(Workflow).where(Workflow.user_id == current_user.id)
    ).all()
    return workflows

@router.patch("/workflows/{workflow_id}", response_model=WorkflowRead)
def update_workflow(
    workflow_id: int,
    workflow_update: WorkflowUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing workflow."""
    db_workflow = get_user_workflow(workflow_id, current_user, session) 
    
    for key, value in workflow_update.model_dump(exclude_unset=True).items():
        setattr(db_workflow, key, value)
    
    session.add(db_workflow)
    session.commit()
    session.refresh(db_workflow)
    main.create_dynamic_job(db_workflow) # <-- FIX: Now using 'main.create_dynamic_job'
    return db_workflow

@router.patch("/workflows/{workflow_id}", response_model=WorkflowRead)
def update_workflow(
    workflow_id: int,
    workflow_update: WorkflowUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing workflow."""
    db_workflow = get_user_workflow(workflow_id, current_user, session) 
    
    for key, value in workflow_update.model_dump(exclude_unset=True).items():
        setattr(db_workflow, key, value)
    
    session.add(db_workflow)
    session.commit()
    session.refresh(db_workflow)
    main.create_dynamic_job(db_workflow) 
    return db_workflow

@router.delete("/workflows/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(
    workflow_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a workflow."""
    db_workflow = get_user_workflow(workflow_id, current_user, session)
    session.delete(db_workflow)
    session.commit()
    return {"ok": True}