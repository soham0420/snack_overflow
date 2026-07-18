import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import OtpInput from "../components/OtpInput";
import CodeCountdownRing from "../components/CodeCountdownRing";
import api from "../services/api";

function TwoFactorVerify() {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "";

    const [code, setCode] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function submitCode(fullCode) {
        setError(null);
        setLoading(true);

        try {
            const response = await api.post("/auth/2fa/verify-login", {
                email,
                code: fullCode
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("security", JSON.stringify(response.data.security));

            navigate("/dashboard");

        } catch (err) {
            const data = err.response?.data;
            if (err.response?.status === 410) {
                setError(`${data?.message || "This login attempt expired."} Redirecting to login…`);
                setTimeout(() => navigate("/login"), 1800);
            } else {
                setError(data?.message || "Invalid or expired code");
            }
            setCode("");
        } finally {
            setLoading(false);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (code.length === 6) submitCode(code);
    }

    if (!email) {
        return (
            <>
                <Navbar />
                <div className="container auth-wrap">
                    <h2>Nothing to verify</h2>
                    <p className="auth-subtitle">Start by logging in again.</p>
                    <button onClick={() => navigate("/login")}>Go to login</button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="container auth-wrap">
                <span className="eyebrow status-pill verify" style={{ marginBottom: "18px" }}>Two-factor authentication</span>
                <h2>Enter your code</h2>
                <p className="auth-subtitle">
                    Open your authenticator app and enter the 6-digit code for {email}.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="otp-header">
                        <label style={{ margin: 0 }}>Authentication code</label>
                        <CodeCountdownRing />
                    </div>

                    <OtpInput
                        value={code}
                        onChange={setCode}
                        onComplete={submitCode}
                        disabled={loading}
                    />

                    <button type="submit" disabled={loading || code.length !== 6}>
                        {loading ? "Verifying…" : "Verify & continue"}
                    </button>

                    {error && <div className="alert-banner">{error}</div>}
                </form>
            </div>

            <Footer />
        </>
    );
}

export default TwoFactorVerify;
