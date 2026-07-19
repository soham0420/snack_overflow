import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Reached right after a successful registration. The backend logs the new
// account in immediately (see authController.register), so this page can
// already offer 2FA setup without sending the person through a separate
// login step first.
function RegisterSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const { name, risk } = location.state || {};

    // Landed here directly (refresh, bookmark, back button) instead of
    // straight from the form — there's nothing to show, so bounce to the
    // dashboard if there's a session, otherwise back to registration.
    useEffect(() => {
        if (!risk) {
            navigate(localStorage.getItem("token") ? "/dashboard" : "/register", { replace: true });
        }
    }, [risk, navigate]);

    if (!risk) return null;

    return (
        <>
            <Navbar />

            <div className="container auth-wrap">
                <div className="feature-card confirm-card">
                    <span className="confirm-mark" aria-hidden="true">✓</span>
                    <span className="eyebrow">Account created</span>
                    <h2>You're registered{name ? `, ${name.split(" ")[0]}` : ""}.</h2>
                    <p className="auth-subtitle" style={{ marginBottom: "22px" }}>
                        Your account is ready and you're signed in.
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "4px 0 18px" }}>
                        <span className="mono" style={{ fontSize: "28px" }}>{risk.riskScore}</span>
                        <span className={`status-pill ${risk.riskLevel === "HIGH" ? "block" : risk.riskLevel === "MEDIUM" ? "verify" : "allow"}`}>
                            {risk.riskLevel} RISK
                        </span>
                    </div>

                    {risk.reasons?.length > 0 && (
                        <ul className="reason-list">
                            {risk.reasons.map((reason, index) => (
                                <li key={index}>{reason}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="feature-card">
                    <div className="field-row" style={{ marginTop: 0 }}>
                        <h2 style={{ marginBottom: 0 }}>Turn on two-factor authentication</h2>
                        <span className="status-pill verify">RECOMMENDED</span>
                    </div>
                    <p className="helper-text">
                        Add a 6-digit code from an authenticator app to every login. Takes about a minute to set up,
                        and you can turn it off again any time from your dashboard.
                    </p>

                    <button onClick={() => navigate("/two-factor-setup")} style={{ marginTop: "18px", width: "100%" }}>
                        Set up two-factor authentication
                    </button>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="btn-ghost"
                        style={{ marginTop: "12px", width: "100%" }}
                    >
                        Skip for now
                    </button>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default RegisterSuccess;
