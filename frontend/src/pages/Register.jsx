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

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/register-success", {
                state: { name, risk: response.data.risk }
            });

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
                <span className="eyebrow">Get started</span>
                <h2>Create account</h2>
                <p className="auth-subtitle">Every registration is screened by the risk engine before it's created.</p>

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
            </div>

            <Footer />
        </>
    );
}

export default Register;
