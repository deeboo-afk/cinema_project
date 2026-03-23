import { Routes, Route } from "react-router-dom";
import "./App.css";
import MoviesPage from "./MoviesPage";
import MovieSeatsPage from "./MovieSeatsPage";
import AdminPage from "./AdminPage";
import LoginPage from "./LoginPage";
import BookedPage from "./BookedPage";
import CreateAccount from "./CreateAccountPage";

//Main Application component, handles all frontend routing using React Router
//For examples, first route path points to the homepage, which shows all the availabe movies.

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MoviesPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/movies/:movieId" element={<MovieSeatsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/booked" element={<BookedPage />} />
      <Route path="/register" element={<CreateAccount />} />
    
    </Routes>
  );
}