from fastapi import APIRouter, Depends, HTTPException
from db import get_db
from sqlalchemy.orm import Session
from sqlalchemy import select
from models import Salon, Seat
from schemas import SalonOut
from collections import defaultdict

#inspiration of creating routes coming from this article: https://medium.com/@thevintagecoder/how-to-build-a-beginner-friendly-movie-booking-system-with-fastapi-3ccf283e1f47

router = APIRouter()

@router.get("/salons", response_model=list[SalonOut])
def list_salons(db: Session = Depends(get_db)):
    salons = db.execute(select(Salon).order_by(Salon.id)).scalars().all()
    return salons

@router.get("/salons/{salon_id}/seats")
def seats_by_salon(salon_id: int, db: Session = Depends(get_db)):
    salon = db.get(Salon, salon_id)
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")

    seats = db.execute(
        select(Seat).where(Seat.salon_id == salon_id).order_by(Seat.row, Seat.number)
    ).scalars().all()

    grouped = defaultdict(list)
    for s in seats:
        grouped[s.row].append(s.number)
    
    # return as normal dict (not defaultdict)
    return {"salon_id": salon_id, "rows": dict(grouped)}