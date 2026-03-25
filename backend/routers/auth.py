
from fastapi import APIRouter, Depends, HTTPException,status
from db import get_db
from models import User
from schemas import UserLogin
from sqlalchemy import select,func,or_
from sqlalchemy.orm import Session
from security import *
from schemas import UserCreate, Token, LoginResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated
from jwt.exceptions import InvalidTokenError
from datetime import timedelta
from jose import jwt, JWTError


#inspiration of creating routes coming from this article: https://medium.com/@thevintagecoder/how-to-build-a-beginner-friendly-movie-booking-system-with-fastapi-3ccf283e1f47


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login/auth")



def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials, Try to login again or create an account to be able to book tickets.",
    headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token,SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception
    
    user = db.get(User, int(user_id))
    if user is None:
        credentials_exception
    
    return user
        
        

@router.post("/login", response_model=LoginResponse)
def login(request: UserLogin, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.username == request.username)).scalar_one_or_none()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail= "Invalid username or password!")
    
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,

}    


#Register a new user and prevent duplicate username/emails for example: "Artin" & "artin" are treated as duplicates.
@router.post("/register")
def register(request: UserCreate, db: Session = Depends(get_db)):
    existing = db.execute(select(User).where(or_(
        func.lower(User.username) == request.username.lower(),
        func.lower(User.email) == request.email.lower()
        )
    )
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Cannot create account, user already exists.")
    
    user = User(
        username = request.username,
        email = request.email,
        password_hash = pwd_context.hash(request.password),
        role="user"
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

        return {"message": "User has been created.",
                "username": user.username}
    
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not create user.")



