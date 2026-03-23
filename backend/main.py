from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from routers import auth, movies, bookings,showtimes, salons
from config import STATIC_DIR, FRONTEND_DIST


#Creates FastAPI application instance
app = FastAPI(title="Cinema Booking System")


#Enable CORS so React (frontend) can communicate with FastAPI (backend)
app.add_middleware (
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)



@app.get("/api/health")
def health():
    return {"status": "ok"}

#serve react build files (statuc frontend assets like js/css)
app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

#serve posters from static/posters
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


#Root API endpoint with info about the system
@app.get("/api")
def root():
    return {"name": "Artin's Cinema Booking System API",
            "status": "running",
            "version": "2.7.0"}

#register all route modules with the api
app.include_router(auth.router, prefix="/api")
app.include_router(movies.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(showtimes.router, prefix="/api")
app.include_router(salons.router, prefix="/api")


#here we catch all the routes to serve react app (for the frontend routing)
@app.get("/{full_path:path}")
def serve_react_app(full_path: str):
    if (
        full_path.startswith("api") or full_path.startswith("static") or full_path.startswith("assets") or "." in full_path):
        raise HTTPException(status_code=404)
    return FileResponse(FRONTEND_DIST / "index.html")

#application runs locally using uvicorn
if __name__ == "__main__": 
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
