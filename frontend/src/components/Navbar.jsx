import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem("token"));

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("security");
        navigate("/login");
    }

    return (
        <nav className="navbar">
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <h2><span className="brand-mark">//</span> SecureAuth AI</h2>
            </Link>

            <div className="nav-links">
                <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>

                {!isLoggedIn && (
                    <>
                        <NavLink to="/register" className={({ isActive }) => isActive ? "active" : ""}>Register</NavLink>
                        <NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>Login</NavLink>
                    </>
                )}

                {isLoggedIn && (
                    <>
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink>
                        <NavLink to="/suspicious-logins" className={({ isActive }) => isActive ? "active" : ""}>Suspicious Logins</NavLink>
                        <button className="btn-ghost" onClick={logout}>Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
