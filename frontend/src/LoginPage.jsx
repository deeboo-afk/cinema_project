import { useState,useEffect } from "react";
import { useNavigate, Link} from "react-router-dom";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Login failed");
            }
            const data = await res.json();
            localStorage.setItem("role", data.role);
            localStorage.setItem("User_id", data.id);
            localStorage.setItem("username", data.username);
            navigate("/");
        } catch (err) {
            setError("Wrong username or password");
        }
    }
    return (
        <div style={{ padding: 24, minHeight: "100vh", color: "#eee" }}>
            <h1>Login</h1>

            <form 
            onSubmit={handleSubmit} 
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
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
                 
            </form>
            {error && <div style={{color: "red" }}>{error}</div>}

            <p>Dont have an account? Create one down below!</p>
            <Link
                to="/register"
                style={{
                    background: "#fff",
                    color: "#000",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontWeight: "bold",
                }}
            >             
                Create Account
            </Link>
        </div>

    );
}