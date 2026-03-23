#Including the functions for hashing password, as well as verifying that the entered password matches the hashed password in the database.

#Code taken from FastAPI documentation: https://www.fastapitutorial.com/blog/password-hashing-fastapi/

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#hashing the user password with bcrypt before storing in the database.
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

#verifying the entered password matches the tstored hashed password in the database.
def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)