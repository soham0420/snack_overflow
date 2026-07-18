import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await api.post("/auth/forgot-password", { email });
            // The reset token is emailed (or, in dev, logged on the server
            // console) — it's never returned in this response, so there's
            // nothing to display here.
            setSubmitted(true);

        } catch (err) {
            setError(err.response?.data?.message || "Unable to connect to backend");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Navbar />

            <div className="container auth-wrap">
                <span className="eyebrow">Account recovery</span>
                <h2>Forgot password</h2>
                <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Sending…" : "Send reset link"}
                    </button>

                    {error && <div className="alert-banner">{error}</div>}
                    {submitted && (
                        <div className="alert-banner success">
                            A reset link has been sent to your email. It expires in 15 minutes.
                        </div>
                    )}
                </form>

                <p className="form-footer-link">
                    Already have a reset token? <Link to="/reset-password">Reset your password</Link>
                </p>
            </div>

            <Footer />
        </>
    );
}

export default ForgotPassword;
