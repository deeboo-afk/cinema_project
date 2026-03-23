from fastapi import APIRouter, Depends, HTTPException
from db import get_db
from sqlalchemy.orm import Session
from sqlalchemy import select
from schemas import ShowtimeOut, ShowTimeCreate
from models import Showtime, Salon, Movie, Seat, Booking
from datetime import datetime

#inspiration of creating routes coming from this article: https://medium.com/@thevintagecoder/how-to-build-a-beginner-friendly-movie-booking-system-with-fastapi-3ccf283e1f47

router = APIRouter()

#gets all showtimes for a movie
@router.get("/movies/{movie_id}/showtimes", response_model=list[ShowtimeOut])
def get_movie_showtimes(movie_id: int, db: Session = Depends(get_db)):
    showtimes = db.execute(
        select(Showtime).where(Showtime.movie_id == movie_id)
        .order_by(Showtime.start_time)
    ).scalars().all()
    return showtimes

@router.post("/showtimes", response_model=ShowtimeOut)
def create_showtime(data: ShowTimeCreate, db: Session = Depends(get_db)):
    movie = db.get(Movie, data.movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    salon = db.get(Salon, data.salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")

    showtime = Showtime(
        movie_id=data.movie_id,
        salon_id=data.salon_id,
        start_time=data.start_time,
    )

    db.add(showtime)
    db.commit()
    db.refresh(showtime)

    return showtime

@router.get("/")

@router.get("/showtimes/{showtime_id}/booked-seats")
def get_booked_seats(showtime_id: int, db: Session = Depends(get_db)):
    showtime = db.get(Showtime, showtime_id)
    if not showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")

    booked_seats = db.execute(
        select(Seat.row, Seat.number)
        .join(Booking, Booking.seat_id == Seat.id)
        .where(Booking.showtime_id == showtime_id)
    ).all()

    return [f"{row}-{number}" for row, number in booked_seats]

@router.get("/showtimes/{showtime_id}")
def get_showtime_for_movie(showtime_id: int, db: Session = Depends(get_db)):
    showtime = db.get(Showtime, showtime_id)
    if not showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")

    return {
        "id": showtime.id,
        "Movie_id": showtime.movie_id,
        "salon_id": showtime.salon_id,
        "start_time": showtime.start_time.isoformat(),
    }