import { useEffect, useState } from "react";
import { Link, useAsyncError, useNavigate } from "react-router-dom";

export default function CreateAccount() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    async function accountSubmit(e){
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch("/api/register",{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password}),

            });
            
            if(!res.ok){
                const errorData = await res.json();
                throw new Error(errorData.detai || "Failed to create account.");
                

            }

            const data = await res.json();
            console.log(data);
            setMessage("Account created, returning to login page!");


            setTimeout(() => {
                navigate("/login");}, 5000);
            
            
        } catch (err){
            setError(err.message);  
            
        }


        }
    
    
    return (
        <div style={{ padding: 24, minHeight: "100vh", color: "#eee" }}>
            <h1>Create Account</h1>

            <form 
            onSubmit={accountSubmit} 
            style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 12, 
                maxWidth: 300 
                }}
            >
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input

                    type="text"
                    placeholder="E-mailadress"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                    
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Create</button>
                {message && <div style={{ color: "lightgreen" }}>{message}</div>}
                 
            </form>
            {error && <div style={{ color: "red" }}>{error}</div>}


        </div>
    );

    
        
}