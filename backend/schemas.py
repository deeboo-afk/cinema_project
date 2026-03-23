from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class ShowtimeOut(BaseModel):
    id: int
    movie_id: int
    salon_id: int
    start_time: datetime


    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username:str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username:str
    password:str

class UserOut(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True

class MovieOut(BaseModel):
    id: int
    title: str
    description: str | None = None
    poster_url: str

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    showtime_id: int
    seats: list[str]  # Format: "A-5" for row A, seat 5
    user_id: int | None = None


class SalonOut(BaseModel):
    id: int
    name: str
    

    class Config:
        from_attributes = True


class ShowTimeCreate(BaseModel):
    movie_id: int
    salon_id: int
    start_time:datetime

    class Config:
        from_attributes = True

