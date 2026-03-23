
from fastapi import APIRouter, Depends, HTTPException
from db import get_db
from models import User
from schemas import UserLogin
from sqlalchemy import select,func,or_
from sqlalchemy.orm import Session
from security import *
from schemas import UserCreate

#inspiration of creating routes coming from this article: https://medium.com/@thevintagecoder/how-to-build-a-beginner-friendly-movie-booking-system-with-fastapi-3ccf283e1f47


router = APIRouter()


#Authenticate a user by username and password

@router.post("/login")
def login(request: UserLogin, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.username == request.username)).scalar_one_or_none()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail= "Invalid username or password!")
    
    return {
        "message": "Login successful",
        "id": user.id,
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

