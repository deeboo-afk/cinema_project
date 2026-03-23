import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

//Confirmation Page shown after a successful booking.
//Uses React Routers useLocation to retrieve booking data (in this case, seats and movie title) passed from the previous page.

export default function BookedPage() {
    const location = useLocation();
    const seats = location.state?.seats || [];
    const movieTitle = location.state?.movieTitle;
   


  return (
    <div style={{ padding: 24, minHeight: "100vh", color: "#9395ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1>Booking confirmed!</h1>

      <p>You booked seats:</p>

      <ul>
        {seats.map((seat) => (                       /*<-- Help received here from ChatGPT to render each booked seat as a list tiem"*/
          <li key={seat}>{seat}</li>
        ))}
      </ul>

      <p>For movie: {movieTitle}</p>
      
      <Link to="/" style={{
        color:"#ffffff", 
        marginTop: 40, 
        textDecoration: "underline", 
        fontSize: 30
      }}>
      Back to movies
      </Link>
        
    </div>
  );
}