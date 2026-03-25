import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import SeatGrid from "./SeatGrid";

export default function MovieSeatsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [showtimes, setShowtimes] = useState([]);
  const [activeShowtimeId, setActiveShowtimeId] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [seatRows, setSeatRows] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [occupiedSeats, setOccupiedSeats] = useState(new Set());
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);

  
   

  useEffect(() => {
    (async () => {
      try {
        setError(null);

        const res = await fetch(`/api/movies/${movieId}/showtimes`);
        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        setShowtimes(data);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [movieId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/movies/${movieId}`);
        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        setMovie(data);
      }
      catch(e){
        setError(e.message);
      }
    })();
  }, [movieId]);

  useEffect(() => {
    if (!activeShowtimeId) return;

    (async () => {
      try {
        setError(null);
        setSeatRows(null);
        setSelected(new Set());

        const showtimeRes = await fetch(`/api/showtimes/${activeShowtimeId}`);
        if (!showtimeRes.ok) throw new Error(await showtimeRes.text());
        const showtimeData = await showtimeRes.json();
        setShowtime(showtimeData);

        const seatsRes = await fetch(`/api/salons/${showtimeData.salon_id}/seats`);
        if (!seatsRes.ok) throw new Error(await seatsRes.text());
        const seatsData = await seatsRes.json();
        setSeatRows(seatsData.rows);

        const bookedRes = await fetch(`/api/showtimes/${activeShowtimeId}/booked-seats`);
        if (!bookedRes.ok) throw new Error(await bookedRes.text());
        const bookedSeats = await bookedRes.json();
        setOccupiedSeats(new Set(bookedSeats));
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [activeShowtimeId]);

  function toggleSeat(key) {
    if (occupiedSeats.has(key)) return;

    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function handleBooking() {
    const token = localStorage.getItem("token");
    
    try {
      setError(null);
      const selectedSeats = Array.from(selected);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          showtime_id: Number(activeShowtimeId),
          seats: selectedSeats,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Booking failed");
      }

      setOccupiedSeats((prev) => new Set([...prev, ...selectedSeats]));
      setSelected(new Set());

      {/* Sending relevant date to confirmation page, such as seats booked, which movie and time. */}
      navigate("/booked", {
        state: {
          seats: selectedSeats,
          movieTitle: movie?.title,
          showtimeId: activeShowtimeId,
        },
      });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={{ padding: 24, minHeight: "100vh", color: "#eee" }}>
      <Link to="/" style={{ color: "#bbb" }}>Back to movies</Link>

      <h1 style={{ marginTop: 12 }}>Choose a time</h1>
      {movie ? (
        <>
          <h2 style= {{marginTop: 8 }}>{movie.title}</h2>
          {movie.description &&(
            <p style={{color: "#aaa", maxWidth: 600}}>
              {movie.description}
              </p>
          )}
        </>
      ) : (
        <p style={{ color: "#aaa"}}>Loading movie....</p>
      )}

      {error && <p style={{ color: "#ff6b6b" }}>Error: {error}</p>}

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          margin: "14px 0 18px",
        }}
      >
        {showtimes.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveShowtimeId(s.id)}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #2a2a2a",
              background: activeShowtimeId === s.id ? "#fff" : "#151515",
              color: activeShowtimeId === s.id ? "#111" : "#eee",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {new Date(s.start_time).toLocaleString()}
          </button>
        ))}
      </div>

      {activeShowtimeId && showtime && (
        <p style={{ color: "#aaa" }}>
          Salon: {showtime.salon_id} | Start:{" "}
          {new Date(showtime.start_time).toLocaleString()}
        </p>
      )}

      {activeShowtimeId && seatRows ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <div className="cinema-container">
            <div className="screen">SCREEN</div>

            <SeatGrid
              rows={seatRows}
              selected={selected}
              occupied={occupiedSeats}
              onToggle={toggleSeat}
            />

            {selected.size > 0 && (
              <button
                onClick={handleBooking}
                style={{
                  marginTop: 20,
                  padding: "12px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "#d61a79",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Book {selected.size} seat{selected.size !== 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>
      ) : activeShowtimeId ? (
        <p>Loading seats…</p>
      ) : (
        <p>Select a showtime to view seats.</p>
      )}
    </div>
  );
}