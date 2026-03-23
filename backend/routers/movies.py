from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from models import Movie, Showtime
from schemas import MovieOut,ShowtimeOut
from sqlalchemy.orm import Session
from db import get_db
from sqlalchemy import select, func
from config import STATIC_DIR
import uuid
import os

#inspiration of creating routes coming from this article: https://medium.com/@thevintagecoder/how-to-build-a-beginner-friendly-movie-booking-system-with-fastapi-3ccf283e1f47


router = APIRouter()


@router.get("/movies/{movie_id}", response_model=MovieOut)
def get_movie_info(movie_id: int, db: Session = Depends(get_db)):
    found_movie = db.get(Movie, movie_id)
    if found_movie is None:
        raise HTTPException(status_code=404, detail="Movie not found")
    return found_movie

@router.get("/movies", response_model=list[MovieOut])
def list_movies(db: Session = Depends(get_db)):
    movie_list = db.execute(select(Movie).order_by(Movie.id)).scalars().all()
    return movie_list




@router.post("/movies", response_model=MovieOut)
async def create_movie(
    title: str = Form(...),
    description: str = Form(""),
    poster: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    #Check that the title is case-insensitive so "Dune" and "dune" dont both get in.
    duplicate_movie = db.execute(select(Movie).where(func.lower(Movie.title) == title.lower())).scalar_one_or_none()
    if duplicate_movie: 
        raise HTTPException(status_code=400, detail=f"Movie '{title}' already exists")

    allowed_types = ("image/jpeg", "image/png", "image/webp")
                                                                                
    if poster.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Poster must be JPEG, PNG, or WEBP")

    #fallback in  case the uploaded filename is weird or missing an extension
    ext = os.path.splitext(poster.filename)[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        ext = ".jpg"

    #Generate unique filename so administrators dont overwrite each other uploads
    random_name = uuid.uuid4().hex
    final_filename = random_name + ext

    posters_dir = STATIC_DIR / "posters"
    posters_dir.mkdir(parents=True, exist_ok=True)

    full_save_path = posters_dir / final_filename

    file_bytes = await poster.read()
    with open(full_save_path, "wb") as out_file:
        out_file.write(file_bytes)

    poster_url = f"/static/posters/{final_filename}"

    new_movie = Movie(title=title, 
                  description=description, 
                  poster_url=poster_url
    )

    try:
        db.add(new_movie)
        db.commit()
        db.refresh(new_movie)
        return new_movie
    
    except Exception:
        db.rollback()
        return {"message": "Movie could not bet created."}


#deletion of movie and poster.
@router.delete("/movies/{movie_id}")
def delete_movie(movie_id: int, db: Session = Depends(get_db)):
    movie_to_delete = db.get(Movie, movie_id)
    if not movie_to_delete:
        raise HTTPException(status_code=404, detail="Movie not found")

    # Delete poster from /static/posters/xxx.jpg..
    poster_file_path = STATIC_DIR / movie_to_delete.poster_url.lstrip("/static/")
    if poster_file_path.exists():
        poster_file_path.unlink()

    db.delete(movie_to_delete)
    db.commit()
    return {"message": "Movie deleted successfully"}

