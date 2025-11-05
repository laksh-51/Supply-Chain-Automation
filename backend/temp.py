import os
from database import get_session
from sqlalchemy import text # Used for executing raw SQL

def clear_all_workflow_logs():
    """Deletes all data from the workflowlog table."""
    try:
        # Use next() to get a session object directly from the generator dependency
        session = next(get_session())
        
        print("--- Deleting ALL entries from 'workflowlog' table... ---")
        
        # Execute raw SQL DELETE statement
        session.exec(text("DELETE FROM workflowlog"))
        
        session.commit()
        print("--- SUCCESS: All workflow history logs have been cleared. ---")
        
    except Exception as e:
        print(f"FATAL CLEANUP ERROR: {e}")
        if 'session' in locals():
            session.rollback()
    finally:
        if 'session' in locals():
            session.close()

if __name__ == "__main__":
    clear_all_workflow_logs()