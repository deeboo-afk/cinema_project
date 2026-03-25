#Including the functions for hashing password, as well as verifying that the entered password matches the hashed password in the database.

#Code taken from FastAPI documentation: https://www.fastapitutorial.com/blog/password-hashing-fastapi/ & https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
import jwt


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d4a1"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

#hashing the user password with bcrypt before storing in the database.
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

#verifying the entered password matches the tstored hashed password in the database.
def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt