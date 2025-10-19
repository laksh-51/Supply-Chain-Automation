# backend/services/llm_translator.py
import os
import json
from google import genai
from google.genai.errors import APIError
from typing import Dict, Any, List


# Initialize Gemini Client (Will use the key from .env automatically)
try:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
except Exception as e:
    # This prevents the app from crashing if the key is missing during startup
    print(f"Warning: Gemini Client initialization failed: {e}")
    client = None


def generate_insight_summary(anomaly_data: Dict[str, Any]) -> str:
    """
    Task 5.1: Converts anomaly data into a human-readable business summary.
    """
    if not client:
        return "AI Insight Service Offline: Missing API Key."

    # Construct the prompt based on the structured data
    prompt = f"""
    You are an expert Supply Chain Analyst. Your task is to provide a concise, professional,
    and urgent narrative summary (max 3 sentences) of the latest supply chain anomaly.
    Focus on the metric, the change, and the potential business impact.

    Anomaly Data: {json.dumps(anomaly_data)}

    Generate the summary:
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text.strip()
    except APIError as e:
        print(f"Gemini API Error (Summary): {e}")
        return "AI Insight Service Error: Could not generate summary."


def translate_natural_language_to_sql(user_query: str, table_schema: List[Dict[str, str]]) -> str:
    """
    Task 5.2: Converts a user's natural language query into a secure SQL SELECT statement.
    The response MUST be a single, valid SQL query string enclosed in triple backticks.
    """
    if not client:
        return "SELECT 'AI Query Service Offline' AS status;"

    # The schema provides the context needed for the model to write correct SQL
    schema_context = json.dumps(table_schema, indent=2)
    
    prompt = f"""
    You are a SQL query generation model. Your goal is to convert a user's plain English request
    into a single, valid PostgreSQL SELECT statement that queries the 'salesdata' table.
    
    Database Schema for 'salesdata':
    {schema_context}
    
    Rules:
    1. Only generate the SQL query itself (e.g., SELECT ...). DO NOT include ANY other text or explanation.
    2. Enclose the final SQL query in triple backticks (```sql).
    3. Use standard SQL functions (e.g., SUM, WHERE, GROUP BY).
    4. For date queries like 'yesterday' or '17th Nov', translate them to standard date comparisons (e.g., '2025-11-17').

    User Query: "{user_query}"
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        # Extract the raw SQL query from the model's response format (```sql...```)
        sql_text = response.text.strip()
        if sql_text.startswith('```sql'):
            return sql_text.replace('```sql', '').replace('```', '').strip()
        return sql_text # Return text if formatting failed (will likely fail later)
        
    except APIError as e:
        print(f"Gemini API Error (SQL Translator): {e}")
        return "SELECT 'AI Translator Error' AS status;"