# backend/services/auth_utils.py
import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from base64 import urlsafe_b64encode, urlsafe_b64decode

# --- FIX: ADD THESE MISSING IMPORTS ---
from fastapi import Depends, HTTPException, status 
from sqlmodel import Session, select
from fastapi.security import OAuth2PasswordBearer

# Import model from the models package (needed for type hinting/querying)
from models.user_model import User 
from database import get_session 
    
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

# --- Hashing and Verification using PBKDF2 (more stable standard) ---
# We use a stable, modern hashing function from the cryptography library
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login") 


def get_password_hash(password: str) -> str:
    """Hashes a password using PBKDF2HMAC for stability and security."""
    
    # Generate a salt for each hash
    salt = os.urandom(16)
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    
    # Hash the password (using its byte representation)
    key = kdf.derive(password.encode('utf-8'))
    
    # Store salt and key combined, encoded safely
    hashed_password = urlsafe_b64encode(salt + key).decode('utf-8')
    return hashed_password

def verify_password(plain_password, hashed_password):
    """Verifies a plaintext password against a stored hash."""
    
    decoded_hash = urlsafe_b64decode(hashed_password.encode('utf-8'))
    
    # Extract salt (first 16 bytes) and stored key (the rest)
    salt = decoded_hash[:16]
    stored_key = decoded_hash[16:]
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    
    # Derive key from the plain password and the stored salt
    new_key = kdf.derive(plain_password.encode('utf-8'))
    
    # Compare the new key with the stored key
    return new_key == stored_key

# --- JWT Token Generation (Keep this standard) ---

def create_access_token(data: dict, expires_delta: int = 30):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) 
    return encoded_jwt

# SECRET_KEY and ALGORITHM are used globally in this file

def get_current_user(session: Session = Depends(get_session), token: str = Depends(oauth2_scheme)):
    """Decodes the JWT token and fetches the corresponding User from the DB."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) 
        
        user_email: str = payload.get("sub")
       
        if user_email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials (No email)")
            
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials (Token expired/malformed)")
        pass 
    # Fetch user from DB using the extracted email
    user = session.exec(select(User).where(User.email == user_email)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found in database")
        
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Ensures the fetched user is active (good for future feature expansion)."""
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user