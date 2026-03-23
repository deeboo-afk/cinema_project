import { useEffect, useState } from "react";
import MoviesPage from "./MoviesPage";
import { Link } from "react-router-dom";

const API_BASE = "";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [poster, setPoster] = useState(null);
  const [salonId, setSalonId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [movies, setMovies] = useState([]);
  const [movieId, setMovieId] = useState("");
  const [showtimeSalonId, setShowtimeSalonId] = useState("");
  const [showtimeStartTime, setShowtimeStartTime] = useState("");

  useEffect(()=> {
    async function fetchmovies(){
      try {
        const res = await fetch("/api/movies");
        if(!res.ok){
          throw new Error("Failed to load movies!");
        }
        const data = await res.json();
        console.log("Movies data:", data)
        setMovies(data);
      }
      catch (err) {
        console.error("Failed to load movies in admin:", err);
      }
    }
    fetchmovies();
  }, []);


  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (!poster) {
        throw new Error("Choose a poster");
      }

      if (!salonId) {
        throw new Error("Choose a salon");
      }

      if (!startTime) {
        throw new Error("Choose a showtime");
      }

      // 1. Create movie
      const movieFormData = new FormData();
      movieFormData.append("title", title);
      movieFormData.append("description", description);
      movieFormData.append("poster", poster);

      const movieRes = await fetch("/api/movies", {
        method: "POST",
        body: movieFormData,
      });

      const movieData = await movieRes.json();

      if (!movieRes.ok) {
        throw new Error(movieData.detail || "Failed to create movie");
      }

      // 2. Create showtime
      const showtimeRes = await fetch("/api/showtimes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movie_id: movieData.id,
          salon_id: Number(salonId),
          start_time: new Date(startTime).toISOString(), //backend expects ISO
        }),
      });

      const showtimeData = await showtimeRes.json();

      if (!showtimeRes.ok) {
        throw new Error(showtimeData.detail || "Movie created, but failed to create showtime");
      }

      setMessage("Movie and showtime created successfully!");

      setTitle("");
      setDescription("");
      setPoster(null);
      setSalonId("");
      setStartTime("");
  
     
    } catch(err){
      setError(err.message);
      console.error(err);
    }
  }


  async function handleShowtimeSubmit (e){
    e.preventDefault();
    setMessage("");
    setError("");

    try{
      const showtimeRes = await fetch("/api/showtimes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movie_id: Number(movieId),
          salon_id: Number(salonId),
          start_time: new Date(showtimeStartTime).toISOString(),
        }),
      });

      const showtimeData = await showtimeRes.json();

      if (!showtimeRes.ok) {
        throw new Error(showtimeData.detail || "Movie created, but failed to create showtime");
      }
    

    setMessage("Showtime created successfully");
    setMovieId("");
    setSalonId("");
    setStartTime("");

    }
    catch (err){
      setError(err.message || "Something went wrong uploading the showtime.");
    }

  }


  return (
    <div style={{ padding: 16, minHeight:"100vh" , color:"#eee"}}>   
      <div
        style={{
          display:"flex",
          justifyContent:"space-between",
          alignItems:"flex-start",
          gap: 40,
          
      }}
   >

        <div style= {{width:"45%"}}>
          <h2>Add new movie</h2>
          <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxWidth: 500,
          }}
      >
        <input
          type="text"
          placeholder="Movie title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 8 }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ padding: 10, borderRadius: 8 }}
        />

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setPoster(e.target.files[0])}
          required
        />

        <select
          value={salonId}
          onChange={(e) => setSalonId(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 8 }}
        >
          <option value="">Choose salon</option>
          <option value="1">Salon 1</option>
          <option value="2">Salon 2</option>
        </select>

        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 8 }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            background: "#fff",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Create movie
        </button>
      </form>
    
    </div>

  <div style={{ width: "45%" }}>
  <h2>Add new showtime</h2>

  <form
    onSubmit={handleShowtimeSubmit}
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 12,
      maxWidth: 500,
    }}
  >
    <select
      value={movieId}
      onChange={(e) => setMovieId(Number(e.target.value))}
      required
      style={{ padding: 10, borderRadius: 8 }}
    >
      <option value="">Choose movie to add a showtime to</option>

      {movies.map((movie) => (
        <option key={movie.id} value={movie.id}>
          {movie.title}
        </option>
      ))}
    </select>

    <select
      value={salonId}
      onChange={(e) => setSalonId(Number(e.target.value))}
      required
      style={{ padding: 10, borderRadius: 8 }}
    >
      <option value="">Choose salon</option>
      <option value="1">Salon 1</option>
      <option value="2">Salon 2</option>
    </select>

    <input
      type="datetime-local"
      value={showtimeStartTime}
      onChange={(e) => setShowtimeStartTime(e.target.value)}
      required
      style={{ padding: 10, borderRadius: 8 }}
    />

    <button
      type="submit"
      style={{
        padding: "10px 16px",
        borderRadius: 10,
        border: "none",
        background: "#fff",
        color: "#000",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      Add showtime
    </button>
  </form>
</div>

<Link
  to="/"
  style={{
    background: "#d61a79",
    color: "#000000",
    padding: "8px 16px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  Back to Movies
</Link>
</div>

    

      {message && <p style={{ color: "#00ff00ee", marginTop: 16 }}>{message}</p>}
      {error && <p style={{ color: "#ff0000", marginTop: 16 }}>{error}</p>}
    </div>
  );
}