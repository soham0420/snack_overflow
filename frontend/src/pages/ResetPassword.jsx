import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";

function ResetPassword() {
    const navigate = useNavigate();

    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.post("/auth/reset-password", { token, newPassword });
            setMessage(response.data.message);
            setTimeout(() => navigate("/login"), 1200);

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
                <h2>Reset password</h2>
                <p className="auth-subtitle">Paste the reset token from your email and choose a new password.</p>

                <form onSubmit={handleSubmit}>
                    <label>Reset token</label>
                    <input
                        type="text"
                        className="mono"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        required
                    />

                    <label>New password</label>
                    <input
                        type="password"
                        placeholder="At least 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Resetting…" : "Reset password"}
                    </button>

                    {error && <div className="alert-banner">{error}</div>}
                    {message && <div className="alert-banner success">{message}</div>}
                </form>
            </div>

            <Footer />
        </>
    );
}

export default ResetPassword;
