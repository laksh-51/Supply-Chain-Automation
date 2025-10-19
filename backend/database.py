# backend/database.py
import os
from sqlmodel import create_engine, Session, SQLModel
from dotenv import load_dotenv


load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# The engine manages the connection to the DB
engine = create_engine(DATABASE_URL, echo=True) # echo=True prints SQL queries (useful for debug)

def create_db_and_tables():
    """Creates all tables defined in models/"""
    # This function looks at all classes that inherit from SQLModel and creates them in the DB
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency to get a database session"""
    with Session(engine) as session:
        yield session