from sqlalchemy import select, func
from db import SessionLocal
from models import Salon, Seat, User

from security import *

#File used to seed the database with inital data.
#Here we create salons, seats for each salon, and a default admin account.


#Function for creating seats for given salon, seats are generrated row by row(A,B,C...) and numbered(1,2,3....)
def create_seats_for_salon(db, salon: Salon, rows: int, seats_per_row: int):
    for r in range(rows):
        row_letter = chr(ord('A') + r)  # Convert 0 -> 'A', 1 -> 'B', etc. ord('A') = 65 in numeric value
        for n in range(1, seats_per_row + 1):
            db.add(Seat(salon_id=salon.id, row=row_letter, number=n))
            
    db.commit()

#utility function to get an existing salon or create a new one
def get_or_create_salon(db, name: str) -> Salon:
    existing = db.execute(select(Salon).where(Salon.name == name)).scalar_one_or_none()
    if existing:
        return existing
    
    
    
    salon = Salon(name=name)
    db.add(salon)
    db.commit()  
    db.refresh(salon) 
    return salon


#ensuring the correct number of seats exist for a salon.
def ensure_seats(db, salon, rows, seat_per_row):
    expected_seats = rows * seat_per_row

    seat_count = db.execute(select(func.count()).select_from(Seat).where(Seat.salon_id == salon.id)).scalar_one() #count the seats and verify that the correct number of seats has been in the database for the salon.

    if seat_count != expected_seats:
        create_seats_for_salon(db, salon, rows, seat_per_row)


#Creates an admin account if it does not already exist.
def get_or_create_admin(db):
    existing = db.execute(select(User).where(User.username == "admin")
    ).scalar_one_or_none()

    if existing:
        return  existing
    
    admin = User(
        username="admin",
        password_hash=hash_password("admin123"),
        role="admin",
        email="Test123@gmail.com"
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

    

def main():
    db = SessionLocal()
    try:

       
        s1 = get_or_create_salon(db, "Salon 1")
        ensure_seats(db, s1, rows=5, seat_per_row=8)

        s2 = get_or_create_salon(db, "Salon 2")
        ensure_seats(db, s2, rows=6, seat_per_row=10) 
       
        get_or_create_admin(db)

        print("Seed complete: 2 salons + seats + admin account created.")

    
    finally:
        db.close()


if __name__ == "__main__":
    main()