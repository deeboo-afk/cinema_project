import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "./MovieGrid.css";


export default function MoviesPage() {



return(
    <div className="page_container">
        
        <div className="bar-at-the-top">
            <h1 className="page-title">Your Bookings</h1>
            
            <p>Choose a booking you would like to <strong>Cancel</strong> in the form below</p>     

            <div className="top-actions">

            
            
                <Link
                    to="/"
                    style={{
                        background: "#ffffff",
                        color: "#000000",
                        padding: "8px 16px",
                        borderRadius: "10px",
                        textDecoration: "none",
                        fontWeight: "bold",
                        display: "inline-block",

                        }}
                        >
                            Back to movies
                        </Link>
            </div>
            
        </div>  
    </div>
);}