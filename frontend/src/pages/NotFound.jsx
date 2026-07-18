import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function NotFound() {
    return (
        <>
            <Navbar />

            <div className="container auth-wrap" style={{ textAlign: "center" }}>
                <span className="eyebrow mono">404</span>
                <h2>Route not recognized</h2>
                <p className="auth-subtitle">This page doesn't exist — much like a login attempt with no matching risk profile.</p>
                <Link to="/"><button>Back home</button></Link>
            </div>

            <Footer />
        </>
    );
}

export default NotFound;
