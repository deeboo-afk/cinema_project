from fastapi import HTTPException, Depends, APIRouter
from db import get_db
from sqlalchemy.orm import Session
from sqlalchemy import select
from models import Showtime, Seat, Booking
from sqlalchemy.exc import IntegrityError

from schemas import BookingCreate

#inspiration of creating routes coming from this article: https://medium.com/@thevintagecoder/how-to-build-a-beginner-friendly-movie-booking-system-with-fastapi-3ccf283e1f47

router = APIRouter()


#function for booking a movie
@router.post("/bookings")
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    showtime = db.get(Showtime, data.showtime_id)
    if not showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")

    created = []
    
   
    try:
        for seat_key in data.seats:
            try:
                row, number = seat_key.split("-")
                number = int(number)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid seat format: {seat_key}")

            seat = db.execute(
                select(Seat).where(
                    Seat.salon_id == showtime.salon_id,
                    Seat.row == row,                                                               
                    Seat.number == number,
                )
            ).scalar_one_or_none()

            if not seat:
                raise HTTPException(status_code=404, detail=f"Seat not found: {seat_key}")

            existing = db.execute(
                select(Booking).where(
                    Booking.showtime_id == data.showtime_id,
                    Booking.seat_id == seat.id,
                
                )
            ).scalar_one_or_none()

            if existing:
                raise HTTPException(status_code=400, detail=f"Seat already booked: {seat_key}")

            booking = Booking(showtime_id=data.showtime_id, seat_id=seat.id, user_id=data.user_id)
            db.add(booking)
            created.append(seat_key)

        db.commit()
        return {"message": "Booking successful", "seats": created}
    
    #Database error, for example if the unique constraints fails when two users try to book the same seat.
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="The chosen seats were already booked.")
    
    #Catches every other error outside the unique constraints error.
    except Exception:
        db.rollback()
        raise