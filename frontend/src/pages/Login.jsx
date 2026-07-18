import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { getDeviceFingerprint, getDeviceName } from "../utils/device";
import { getLoginContext } from "../utils/geo";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [context, setContext] = useState(null);
    const navigate = useNavigate();

    // Look up the approximate location + VPN status as soon as the page
    // loads, so it's ready by the time the person submits the form (no
    // extra delay on submit).
    useEffect(() => {
        getLoginContext().then(setContext);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const loginContext = context || (await getLoginContext());

            const response = await api.post("/auth/login", {
                email,
                password,
                device: getDeviceName(),
                deviceFingerprint: getDeviceFingerprint(),
                location: loginContext.location,
                vpnDetected: loginContext.vpnDetected
            });

            // 2FA is enabled on this account -> no token yet, go collect the code
            if (response.data.twoFactorRequired) {
                navigate("/two-factor", { state: { email } });
                return;
            }

            // Risk was LOW -> backend already issued a token
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("security", JSON.stringify(response.data.security));

            navigate("/dashboard");

        } catch (err) {
            const data = err.response?.data;

            // Risk was MEDIUM -> backend wants step-up (approval phrase) verification
            if (data?.verificationRequired) {
                navigate("/security-check", { state: { email, security: data.security } });
                return;
            }

            // Risk was HIGH -> backend blocked the login outright, or bad credentials
            setError(data?.message || "Unable to connect to backend");

        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Navbar />

            <div className="container auth-wrap">
                <span className="eyebrow">Welcome back</span>
                <h2>Login</h2>
                <p className="auth-subtitle">Sign in to see your live security dashboard.</p>

                <form onSubmit={handleSubmit}>
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
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="field-row">
                        <Link to="/forgot-password">Forgot password?</Link>
                        <span className="helper-text" style={{ marginTop: 0 }}>
                            {context ? `📍 ${context.location}` : "Detecting location…"}
                        </span>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Checking risk…" : "Login"}
                    </button>

                    {error && <div className="alert-banner">{error}</div>}
                </form>

                <p className="form-footer-link">
                    No account? <Link to="/register">Register</Link>
                </p>
            </div>

            <Footer />
        </>
    );
}

export default Login;
