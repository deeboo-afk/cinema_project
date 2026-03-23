import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv() # load environment variables from .env file

#Retreive database connection string from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing. Add it to .env")

#creates database engine (Connection to PostgreSQL)
#pool_pre_ping makes sure that stale or closed database connections are detected and replaced before being used
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Base class for all SQLalchemy models
Base = declarative_base()

#function for testing db connection
def test_db_connection() -> str:
    with engine.connect() as conn:
        return conn.execute(text("SELECT version();")).scalar_one()

#function taken from article: https://medium.com/@thevintagecoder/how-to-build-a-beginner-friendly-movie-booking-system-with-fastapi-3ccf283e1f47
#dependecy function for FastAPI routes, provides a database session and ensures it is closed after use
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()