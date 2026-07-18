import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <h2>🔐 SecureAuth AI</h2>

      <div className="nav-links">

        <Link to="/">Home</Link>

        <Link to="/register">Register</Link>

        <Link to="/login">Login</Link>

        <Link to="/dashboard">Dashboard</Link>

      </div>

    </nav>
  );
}

export default Navbar;