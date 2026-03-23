import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MovieCard.css";
import "./MovieGrid.css";

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isMember = role === "user";
  const isLoggedIn = isAdmin || isMember;

  
  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await fetch("/api/movies");
        if(!res.ok) throw new Error('API error')
        const movies = await res.json();
        setMovies(movies);
      } catch (err) {
        console.error("Failed to load movies:", err);
        
      }
    }

    fetchMovies();
  }, []);


  return (
    <div className="page_container">
      
      <div className="bar-at-the-top">

        <h1 className="page-title">Movies</h1>

        <div className="top-actions">
           

          {isAdmin && (
          
            <Link
              to="/admin"
              style={{
                background: "#ffffff",
                color: "#000000",
                padding: "8px 16px",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Admin Panel
            </Link>
          )}

          {isMember && (

            <Link
            to="/mybookingspage"
            style={{
              background: "#ffffff",
              color: "#000000",
              padding: "8px 16px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "bold",

            }}
            >
              My bookings
            </Link>
          )}

          {isLoggedIn ? (

            <button
              onClick={() => {
                localStorage.removeItem("role");
                window.location.reload();
              }}
              style={{
                background: "#d61a79",
                color: "#000000",
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          
        
        ) : (
          <Link
            to="/login"
            style={{
              background: "#ffffff",
              color: "#000000",
              padding: "8px 16px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "bold",
              display:"inline-block",
            }}
          >
            Login
          </Link>
        )}
      </div>
    </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap:40,
          maxWidth: 1200,
          margin: "0 auto"
        }}
        
      >
      
       {movies.map((m) => (
        <div 
          key={m.id}
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
      >
        <Link
          to={`/movies/${m.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="movie-card"
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <img
          src={m.poster_url}
          alt={m.title}
          style={{
            width: "100%",
            borderRadius: 12,
            aspectRatio: "2 / 3",
            objectFit: "cover",
          }}
        />
        <div style={{ marginTop: 10, fontWeight: 700, marginBottom:10 }}>
          {m.title}
        </div>
      </div>
    </Link>

    {isAdmin && (
      <button
        onClick={async () => {
          try {
            const res = await fetch(`/api/movies/${m.id}`, {
              method: "DELETE",
            });

            if (!res.ok) {
              throw new Error("Movie doesnt exist!");
            }
          } catch (err) {
            console.log(err);
          }

          window.location.reload(false);
        }}
        style={{
          marginTop: "auto",
          background: "#ff0000",
          color: "#000000",
          padding: "8px 16px",
          borderRadius: "10px",
          fontWeight: "bold",
          width: "100%",
          cursor: "pointer",
        }}
      >
        Delete movie
      </button>
    )}
  </div>
  
))}
</div>
</div>
  )};
