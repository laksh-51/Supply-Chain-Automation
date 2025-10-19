# backend/services/gmail_monitor.py

import os
import io
import sys 
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from base64 import urlsafe_b64decode

# --- Import and Configuration Setup ---
from dotenv import load_dotenv

# 1. Load .env file (assuming it's in the parent directory)
# This is necessary when running the script directly or as an imported module
try:
    # Get the directory of the current script (services/)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
    # Go up one level to the backend/ folder
    BACKEND_DIR = os.path.dirname(BASE_DIR) 
    load_dotenv(os.path.join(BACKEND_DIR, '.env')) 
except Exception as e:
    print(f"Warning: Could not load .env file during startup: {e}")


# --- Configuration Constants ---
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'] 
CREDENTIALS_FILENAME = os.getenv("GMAIL_CREDENTIALS_FILE", "credentials.json")
TOKEN_FILENAME = 'token.json' 

# 2. CONSTRUCT ABSOLUTE PATHS using the determined backend directory
CREDENTIALS_FILE_PATH = os.path.join(BACKEND_DIR, CREDENTIALS_FILENAME)
TOKEN_FILE_PATH = os.path.join(BACKEND_DIR, TOKEN_FILENAME) 
# -----------------------------

def get_gmail_service():
    """Initializes and returns the authorized Gmail API service."""
    creds = None
    
    # 1. Check for existing token.json file using the full path
    if os.path.exists(TOKEN_FILE_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE_PATH, SCOPES)
        
    # 2. Handle token expiration or absence
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("INFO: Refreshing Gmail API token...")
            creds.refresh(Request())
        else:
            # --- START MANUAL AUTHORIZATION FLOW (Requires: credentials.json) ---
            print("INFO: Initiating NEW Gmail API Authorization Flow...")
            try:
                # Use the absolute path for the credentials file
                flow = InstalledAppFlow.from_client_secrets_file(
                    CREDENTIALS_FILE_PATH, SCOPES)
            except FileNotFoundError:
                print(f"\nFATAL ERROR: Credentials file '{CREDENTIALS_FILENAME}' not found.")
                print(f"Please ensure it is located at: {CREDENTIALS_FILE_PATH}")
                # Exiting cleanly to prevent the 500 error propagation
                sys.exit(1)

            # Set the redirect URI for console apps
            flow.redirect_uri = 'urn:ietf:wg:oauth:2.0:oob'
            
            auth_url, _ = flow.authorization_url(prompt='consent')
            
            print("\n----------------------------------------------------------------------")
            print("🚨 MANUAL AUTHENTICATION REQUIRED 🚨")
            print("1. Copy the following URL and open it in your web browser:")
            print(f"\n   {auth_url}\n")
            print("2. Sign in to your Gmail account and GRANT permission.")
            print("3. Google will show you a code (the authorization code).")
            code = input("4. PASTE the authorization code here and press Enter: ")
            
            # Exchange the code for the token
            flow.fetch_token(code=code)
            creds = flow.credentials
            print("SUCCESS: Token retrieved and saved.")
            # --- END MANUAL AUTHORIZATION FLOW ---
            
        # 3. Save the new/refreshed credentials using the full path
        with open(TOKEN_FILE_PATH, 'w') as token:
            token.write(creds.to_json())
            
    # 4. Build and return the service object
    service = build('gmail', 'v1', credentials=creds)
    return service

def find_and_download_attachment(user_id='me', search_query=''):
    """
    Searches for an email, downloads the attachment, and returns its raw binary data.
    """
    # NOTE: This call will trigger the authorization flow if token.json is missing or expired.
    service = get_gmail_service()
    
    if service is None:
        # Service failed to initialize, usually due to the sys.exit(1) in auth flow
        print("ERROR: Gmail service could not be initialized.")
        return None, None
        
    # --- Search and Download Logic ---
    try:
        # 1. Search for the email (logic unchanged)
        response = service.users().messages().list(userId=user_id, q=search_query, maxResults=1).execute()
        
        messages = response.get('messages', [])
        if not messages:
            print(f"INFO: No emails found matching query: '{search_query}'")
            return None, None
            
        message_id = messages[0]['id']
        
        # 2. Get the full message details and find the attachment part (logic unchanged)
        msg = service.users().messages().get(userId=user_id, id=message_id).execute()
        
        attachment_id = None
        file_name = None
        for part in msg['payload']['parts']:
             if part.get('filename') and part.get('body').get('attachmentId'):
                attachment_id = part['body']['attachmentId']
                file_name = part['filename']
                break
        
        if not attachment_id:
             print("INFO: Email found, but no attached file detected.")
             return None, None
             
        # 3. Download the attachment data (logic unchanged)
        att_data = service.users().messages().attachments().get(
            userId=user_id, messageId=message_id, id=attachment_id).execute()
        
        file_data = urlsafe_b64decode(att_data['data'])
        
        print(f"SUCCESS: Found and downloaded attachment: {file_name}")
        return file_data, file_name 
            
    except HttpError as error:
        print(f"An HTTP error occurred during message retrieval: {error}")
        return None, None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None, None


if __name__ == '__main__':
    # This block forces the script to execute the authorization flow when run directly
    print("--- Running Gmail Monitor for Authorization Test ---")
    get_gmail_service() 
    print("--- Authorization test finished. Check for token.json in the backend/ folder. ---")