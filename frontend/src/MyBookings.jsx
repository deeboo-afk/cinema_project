import { use, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "./MovieGrid.css";


export default function MoviesPage() {
    const [mybookings, setMybookings] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState("");
    const [error, setError] = useState(null);

    
    async function fetchMyBookings(){
        const token = localStorage.getItem("token");

        try {
            setError(null);

            const res = await fetch("/api/bookings/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            

            const data = await res.json();

            if(!res.ok){
                throw new Error(data.detail || "Could not find any bookings.");
            }
            setMybookings(data);
        } catch(e){
            setError(e.message);
        }

    }

    useEffect(()=> {
        fetchMyBookings();

        
}, []);
    
    
    async function handleCancelBooking(e){
       
        e.preventDefault();

        const token = localStorage.getItem("token");

        try{
            setError(null);


            
            const res = await fetch(`/api/bookings/${selectedBookingId}`,{
                method: "DELETE",
                headers:{
                    Authorization: `Bearer ${token}`,

                },
            

            });

            const data = await res.json();

            if(!res.ok){
                throw new Error(data.detail || "Could not cancel booking")
            }
            
            //reload bookings
            await fetchMyBookings();

            setSelectedBookingId("");
        }   catch(e){
            setError(e.message);
        }

    }
    
 

return(
    <div className="page_container">
        <div className="bar-at-the-top">
            <h1 className="page-title">Your Bookings</h1>
            <p>Choose a booking you would like to <strong>Cancel</strong> in the form below</p>    
            
            <div className="top-actions">
                <Link to="/">Back to Movies</Link>  
            </div>
            
            <div style= {{marginTop: "20px"}}>

                <form
                    onSubmit={handleCancelBooking}
                    style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    maxWidth: 500,
                    }}
                >
                    <select
                        value={selectedBookingId}
                        onChange={(e) => setSelectedBookingId(e.target.value)}
                        required
                        style={{ padding: 10, borderRadius: 8 }}
                    >
                        <option value="">Choose booking to cancel</option>

                        {mybookings.map((booking) => (
                            <option key={booking.id} value={booking.id}>
                                {booking.movie_title} - {booking.showtime_time} - {booking.seat}
                            </option>
                            
                            
                        ))}

                    </select>

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
                    Cancel booking
                    </button>
                
                </form>     
                {error && <p style={{ color: "red"}}>{error}</p>}
            
            </div>

        </div>  
    </div>
)};