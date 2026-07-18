import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RiskGauge from "../components/RiskGauge";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { getDeviceFingerprint } from "../utils/device";

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

function Dashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const security = JSON.parse(localStorage.getItem("security") || "null");

    const [overview, setOverview] = useState(null);
    const [overviewError, setOverviewError] = useState(null);
    const thisDeviceFingerprint = getDeviceFingerprint();

    useEffect(() => {
        if (!user) return;

        api.get("/auth/dashboard")
            .then((response) => setOverview(response.data))
            .catch(() => setOverviewError("Couldn't load account activity right now."));
    }, [user]);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("security");
        navigate("/login");
    }

    if (!user || !security) {
        return (
            <>
                <Navbar />
                <div className="container auth-wrap">
                    <h2>No security data found</h2>
                    <p className="auth-subtitle">Please login to see your dashboard.</p>
                    <button onClick={() => navigate("/login")}>Go to login</button>
                </div>
                <Footer />
            </>
        );
    }

    const safetyScore = 100 - security.riskScore;
    const recentHistory = (overview?.loginHistory || []).slice(0, 5);
    const alertCount = (overview?.loginHistory || []).filter(r => r.reasons?.length > 0).length;

    return (
        <>
            <Navbar />

            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <span className="eyebrow">Signed in as {user.email}</span>
                        <h1>Security dashboard</h1>
                    </div>
                    <button className="btn-ghost" onClick={logout}>Logout</button>
                </div>

                <div className="dashboard-grid">

                    <div className="feature-card gauge-card">
                        <h2>Security score</h2>
                        <RiskGauge score={security.riskScore} />
                        <div className="gauge-score">{safetyScore}<span style={{ fontSize: "18px", color: "var(--text-muted)" }}>/100</span></div>
                        <div className="gauge-label">Risk level: {security.riskLevel}</div>
                        <span className={`status-pill ${decisionClass(security.decision)}`} style={{ marginTop: "14px" }}>
                            {security.decision}
                        </span>
                    </div>

                    <div className="feature-card">
                        <h2>Why this score</h2>
                        {security.reasons?.length > 0 ? (
                            <ul className="reason-list">
                                {security.reasons.map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="helper-text" style={{ marginTop: 0 }}>No threats detected ✅</p>
                        )}
                    </div>

                    <div className="feature-card">
                        <h2>Security insights</h2>
                        <ul className="reason-list">
                            {security.insights?.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="feature-card">
                        <h2>Recommendations</h2>
                        <ul className="reason-list recommend-list">
                            {security.recommendations?.length > 0 ? (
                                security.recommendations.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))
                            ) : (
                                <li>Nothing to act on right now</li>
                            )}
                        </ul>
                    </div>

                    <div className="feature-card">
                        <h2>Account status</h2>
                        {overviewError && <p className="helper-text" style={{ marginTop: 0 }}>{overviewError}</p>}
                        {!overviewError && !overview && <p className="helper-text" style={{ marginTop: 0 }}>Loading…</p>}
                        {overview && (
                            <ul className="status-list">
                                <li>
                                    <span>Account lock</span>
                                    <span className={`status-pill ${overview.account.isLocked ? "block" : "allow"}`}>
                                        {overview.account.isLocked ? "LOCKED" : "UNLOCKED"}
                                    </span>
                                </li>
                                <li>
                                    <span>Failed login attempts</span>
                                    <span className="mono">{overview.account.failedAttempts} / 5</span>
                                </li>
                                {overview.account.isLocked && (
                                    <li>
                                        <span>Locked until</span>
                                        <span className="mono">{formatTimestamp(overview.account.lockUntil)}</span>
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>

                    <div className="feature-card">
                        <div className="field-row" style={{ marginTop: 0 }}>
                            <h2 style={{ marginBottom: 0 }}>Two-factor authentication</h2>
                            {overview && (
                                <span className={`status-pill ${overview.account.twoFactorEnabled ? "allow" : "block"}`}>
                                    {overview.account.twoFactorEnabled ? "ON" : "OFF"}
                                </span>
                            )}
                        </div>
                        <p className="helper-text" style={{ marginTop: "10px" }}>
                            {overview?.account.twoFactorEnabled
                                ? "A code from your authenticator app is required on every login."
                                : "Add an authenticator app code as a second login step."}
                        </p>
                        <Link to="/two-factor-setup">
                            <button className={overview?.account.twoFactorEnabled ? "btn-ghost" : ""} style={{ marginTop: "14px" }}>
                                {overview?.account.twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
                            </button>
                        </Link>
                    </div>

                    <div className="feature-card">
                        <h2>Trusted devices</h2>
                        {overview && overview.trustedDevices.length === 0 && (
                            <p className="helper-text" style={{ marginTop: 0 }}>No trusted devices yet.</p>
                        )}
                        {overview && overview.trustedDevices.length > 0 && (
                            <ul className="status-list">
                                {overview.trustedDevices.map((device) => (
                                    <li key={device.id}>
                                        <span>
                                            {device.deviceName || "Unknown device"}
                                            {device.deviceFingerprint === thisDeviceFingerprint && (
                                                <span className="status-pill allow" style={{ marginLeft: "8px" }}>THIS DEVICE</span>
                                            )}
                                        </span>
                                        <span className="mono helper-text" style={{ marginTop: 0 }}>
                                            Added {formatTimestamp(device.addedAt)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="feature-card" style={{ gridColumn: "1 / -1" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                            <h2 style={{ marginBottom: 0 }}>Recent login history</h2>
                            <Link to="/suspicious-logins">
                                <button className="btn-ghost">
                                    View suspicious login alerts {alertCount > 0 && `(${alertCount})`}
                                </button>
                            </Link>
                        </div>

                        {overview && recentHistory.length === 0 && (
                            <p className="helper-text" style={{ marginTop: 0 }}>No login history yet.</p>
                        )}
                        {recentHistory.length > 0 && (
                            <ul className="status-list">
                                {recentHistory.map((record) => (
                                    <li key={record.id}>
                                        <span>
                                            {record.device || "Unknown device"} · {record.location || "Unknown location"}
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span className="mono helper-text" style={{ marginTop: 0 }}>
                                                {formatTimestamp(record.createdAt)}
                                            </span>
                                            <span className={`status-pill ${decisionClass(record.decision)}`}>{record.decision}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>
            </div>

            <Footer />
        </>
    );
}

export default Dashboard;
