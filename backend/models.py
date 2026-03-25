from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint, DateTime, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime

from pydantic import EmailStr

from db import Base

#Inspiration of models taken from this article: https://medium.com/@thevintagecoder/how-to-build-a-beginner-friendly-movie-booking-system-with-fastapi-3ccf283e1f47
#But also from documentation from: https://docs.sqlalchemy.org/en/20/orm/quickstart.html and https://docs.sqlalchemy.org/en/20/orm/mapping_styles.html
#This file defines all database models(tables) using SQLAlchemy ORM. Each Class represents a table, and each attribute represents a column in the database.

class Salon(Base):
    __tablename__ = "salons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    #if a salon is deleted, all its seats are also deleted.
    seats: Mapped[list["Seat"]] = relationship(
        "Seat",
        back_populates="salon",
        cascade="all, delete-orphan",
    )

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    #email and username must be unique to prevent duplicates.
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)

    #always store password as a hash in the database
    password_hash: Mapped[str] = mapped_column(String, nullable=False)

   
    role: Mapped[str] = mapped_column(String, nullable=False, default="user")

class Seat(Base):
    __tablename__ = "seats"

    #Ensures that the same seat (A-1, A-2 for example) cannot exist twice in the same salon
    __table_args__ = (
        UniqueConstraint("salon_id", "row", "number", name="unique_seat_in_salon"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    salon_id: Mapped[int] = mapped_column(ForeignKey("salons.id"), nullable=False)

    row: Mapped[str] = mapped_column(String(5), nullable=False)
    number: Mapped[int] = mapped_column(Integer, nullable=False)

    salon: Mapped["Salon"] = relationship(
        "Salon",
        back_populates="seats",
    )


class Movie(Base):
    __tablename__ = "movies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    #movie title must be unique to avoid duplicates
    title: Mapped[str] = mapped_column(String,unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    poster_url: Mapped[str] = mapped_column(String, nullable=False)

    #One movie can have multiple showtimes, if a movie is deleted all related showtimes are also deleted
    showtimes: Mapped[list["Showtime"]] = relationship(
        "Showtime",
        back_populates="movie",
        cascade="all, delete-orphan",
    )


class Showtime(Base):
    __tablename__ = "showtimes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    #each showtime belongs to one movie and one salon
    movie_id: Mapped[int] = mapped_column(ForeignKey("movies.id"), nullable=False)
    salon_id: Mapped[int] = mapped_column(ForeignKey("salons.id"), nullable=False)
    
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    movie: Mapped["Movie"] = relationship("Movie", back_populates="showtimes")
    salon: Mapped["Salon"] = relationship("Salon")
    
    #one showtime can have multiple bookings
    bookings: Mapped[list["Booking"]] = relationship("Booking", cascade="all, delete-orphan")

class Booking(Base):
    __tablename__ = "bookings"

    #prevents double booking of the same seat for the same showtime, IMPORTANT!
    __table_args__ = (
        UniqueConstraint("showtime_id", "seat_id", name="unique_booking_seat_showtime"),
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    #each booking is tied to a showtime and a seat
    showtime_id: Mapped[int] = mapped_column(ForeignKey("showtimes.id"), nullable=False)
    seat_id: Mapped[int] = mapped_column(ForeignKey("seats.id"), nullable=False)

    #User can be null if its a guest booking
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    showtime: Mapped["Showtime"] = relationship("Showtime")
    seat: Mapped["Seat"] = relationship("Seat")