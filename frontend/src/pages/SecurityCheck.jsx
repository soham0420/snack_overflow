import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";

function SecurityCheck() {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "";
    const security = location.state?.security || null;

    const [answer, setAnswer] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function verify(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.post("/auth/verify-approval", {
                email,
                approvalPhrase: answer
            });

            // 2FA is enabled on this account -> no token yet, go collect the code
            if (response.data.twoFactorRequired) {
                navigate("/two-factor", { state: { email } });
                return;
            }

            // Same as a direct login success — save token, user, and the
            // full security payload so the dashboard has reasons/insights
            // to show right away instead of coming up empty.
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("security", JSON.stringify(response.data.security));

            navigate("/dashboard");

        } catch (err) {
            const data = err.response?.data;
            if (err.response?.status === 410) {
                setError(`${data?.message || "Verification expired."} Redirecting to login…`);
                setTimeout(() => navigate("/login"), 1800);
            } else {
                setError(data?.message || "Verification failed");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Navbar />

            <div className="container auth-wrap">
                <span className="eyebrow status-pill verify" style={{ marginBottom: "18px" }}>Elevated risk detected</span>
                <h2>Additional verification</h2>
                <p className="auth-subtitle">
                    This login looked unusual, so confirm the security answer you set during registration.
                </p>

                {security?.reasons?.length > 0 && (
                    <div className="feature-card" style={{ marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
                            Why we're asking (risk score {security.riskScore}/100)
                        </h2>
                        <ul className="reason-list">
                            {security.reasons.map((reason, index) => (
                                <li key={index}>{reason}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={verify}>
                    <label>Security answer</label>
                    <input
                        required
                        placeholder="Your answer"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Verifying…" : "Verify"}
                    </button>

                    {error && <div className="alert-banner">{error}</div>}
                </form>
            </div>

            <Footer />
        </>
    );
}

export default SecurityCheck;
