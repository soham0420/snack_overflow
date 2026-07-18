import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // securityAnswer doubles as the "approval phrase" used later
            // for step-up verification on risky logins.
            const response = await api.post("/auth/register", {
                name,
                email,
                password,
                approvalPhrase: securityAnswer,
                captchaPassed: true
            });

            setResult(response.data.risk);

        } catch (err) {
            setError(err.response?.data?.message || "Unable to connect to backend");
        } finally {
            setLoading(false);
        }
    }

    function continueToLogin() {
        navigate("/login");
    }

    return (
        <>
            <Navbar />

            <div className="container auth-wrap">
                <span className="eyebrow">Get started</span>
                <h2>Create account</h2>
                <p className="auth-subtitle">Every registration is screened by the AI risk engine before it's created.</p>

                <form onSubmit={handleSubmit}>
                    <label>Full name</label>
                    <input
                        type="text"
                        placeholder="Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                    />

                    <label>Security question</label>
                    <select
                        required
                        value={securityQuestion}
                        onChange={(e) => setSecurityQuestion(e.target.value)}
                    >
                        <option value="">Select a question</option>
                        <option value="teacher">Favourite teacher's name</option>
                        <option value="pet">First pet's name</option>
                        <option value="school">First school</option>
                        <option value="city">Birth city</option>
                    </select>

                    <label>Security answer</label>
                    <input
                        required
                        type="text"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        placeholder="Used for extra verification on risky logins"
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Screening…" : "Register"}
                    </button>

                    {error && <div className="alert-banner">{error}</div>}
                </form>

                <p className="form-footer-link">
                    Already have an account? <Link to="/login">Login</Link>
                </p>

                {result && (
                    <div className="feature-card">
                        <h2>Registration successful</h2>

                        <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "14px 0" }}>
                            <span className="mono" style={{ fontSize: "32px" }}>{result.riskScore}</span>
                            <span className={`status-pill ${result.riskLevel === "HIGH" ? "block" : result.riskLevel === "MEDIUM" ? "verify" : "allow"}`}>
                                {result.riskLevel} RISK
                            </span>
                        </div>

                        {result.reasons.length > 0 && (
                            <ul className="reason-list">
                                {result.reasons.map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                ))}
                            </ul>
                        )}

                        <button onClick={continueToLogin} style={{ marginTop: "16px" }}>
                            Continue to login
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}

export default Register;
