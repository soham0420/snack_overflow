import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

// Maps the raw reason strings the risk engine already produces (see
// backend/services/loginRisk.js) onto the three alert categories this page
// is meant to surface: new device, new login/IP, unusual time. VPN and
// repeated-failure reasons are shown too since they're also useful context,
// just not one of the three named categories.
function reasonToTag(reason) {
    if (reason === "New device detected") return "New device detected";
    if (reason === "Different location") return "New login / IP detected";
    if (reason === "Late night login") return "Unusual login time";
    return reason;
}

function decisionClass(decision) {
    if (decision === "BLOCK") return "block";
    if (decision === "VERIFY") return "verify";
    return "allow";
}

function formatTimestamp(iso) {
    if (!iso) return "Unknown time";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "Unknown time";
    return date.toLocaleString();
}

function SuspiciousLogins() {
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [error, setError] = useState(null);
    const loggedIn = Boolean(localStorage.getItem("token"));

    useEffect(() => {
        if (!loggedIn) return;

        api.get("/auth/dashboard")
            .then((response) => setOverview(response.data))
            .catch(() => setError("Couldn't load login history right now."));
    }, [loggedIn]);

    if (!loggedIn) {
        return (
            <>
                <Navbar />
                <div className="container auth-wrap">
                    <h2>No session found</h2>
                    <p className="auth-subtitle">Please login to see suspicious login alerts.</p>
                    <button onClick={() => navigate("/login")}>Go to login</button>
                </div>
                <Footer />
            </>
        );
    }

    const alerts = (overview?.loginHistory || []).filter(record => record.reasons?.length > 0);

    return (
        <>
            <Navbar />

            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <span className="eyebrow">{alerts.length} flagged sign-in{alerts.length === 1 ? "" : "s"}</span>
                        <h1>Suspicious login alerts</h1>
                    </div>
                    <Link to="/dashboard"><button className="btn-ghost">Back to dashboard</button></Link>
                </div>

                {error && <div className="alert-banner">{error}</div>}
                {!error && !overview && <p className="helper-text">Loading…</p>}

                {overview && alerts.length === 0 && (
                    <div className="feature-card">
                        <p className="helper-text" style={{ marginTop: 0 }}>
                            No unusual sign-ins yet — every login so far came from a known device, a familiar
                            location, and a normal time of day. ✅
                        </p>
                    </div>
                )}

                <div className="dashboard-grid">
                    {alerts.map((record) => (
                        <div className="feature-card alert-card" key={record.id}>
                            <div className="alert-card-header">
                                <span className="mono helper-text" style={{ marginTop: 0 }}>
                                    {formatTimestamp(record.createdAt)}
                                </span>
                                <span className={`status-pill ${decisionClass(record.decision)}`}>
                                    {record.decision} · {record.riskScore}/100
                                </span>
                            </div>

                            <div className="alert-tags">
                                {record.reasons.map((reason, index) => (
                                    <span className="alert-tag" key={index}>⚠ {reasonToTag(reason)}</span>
                                ))}
                            </div>

                            <p className="helper-text" style={{ marginTop: 0 }}>
                                {record.device || "Unknown device"} · {record.location || "Unknown location"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </>
    );
}

export default SuspiciousLogins;
