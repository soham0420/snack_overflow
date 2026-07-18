import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import OtpInput from "../components/OtpInput";
import CodeCountdownRing from "../components/CodeCountdownRing";
import api from "../services/api";

function TwoFactorSetup() {
    const navigate = useNavigate();

    const [status, setStatus] = useState(null); // null while loading, then "enabled" | "disabled"
    const [statusError, setStatusError] = useState(null);

    // ---- Enable flow ----
    const [starting, setStarting] = useState(false);
    const [setupData, setSetupData] = useState(null); // { qrCode, manualEntryKey }
    const [code, setCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(null);
    const [enabled, setEnabled] = useState(false);

    // ---- Disable flow ----
    const [password, setPassword] = useState("");
    const [disabling, setDisabling] = useState(false);
    const [disableError, setDisableError] = useState(null);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        api.get("/auth/dashboard")
            .then((response) => setStatus(response.data.account.twoFactorEnabled ? "enabled" : "disabled"))
            .catch(() => setStatusError("Couldn't load your account status right now."));
    }, []);

    async function beginSetup() {
        setStarting(true);
        setVerifyError(null);

        try {
            const response = await api.post("/auth/2fa/setup");
            setSetupData(response.data);
        } catch (err) {
            setVerifyError(err.response?.data?.message || "Couldn't start 2FA setup");
        } finally {
            setStarting(false);
        }
    }

    async function confirmCode(fullCode) {
        setVerifying(true);
        setVerifyError(null);

        try {
            await api.post("/auth/2fa/verify-setup", { code: fullCode });
            setEnabled(true);
        } catch (err) {
            setVerifyError(err.response?.data?.message || "Invalid code. Please try again.");
            setCode("");
        } finally {
            setVerifying(false);
        }
    }

    async function handleDisable(e) {
        e.preventDefault();
        setDisabling(true);
        setDisableError(null);

        try {
            await api.post("/auth/2fa/disable", { password });
            setDisabled(true);
        } catch (err) {
            setDisableError(err.response?.data?.message || "Couldn't disable 2FA");
        } finally {
            setDisabling(false);
        }
    }

    return (
        <>
            <Navbar />

            <div className="container auth-wrap">
                <span className="eyebrow">Account security</span>
                <h2>Two-factor authentication</h2>
                <p className="auth-subtitle">
                    Add a second step to login using any TOTP authenticator app — Google Authenticator, Authy, 1Password, etc.
                </p>

                {statusError && <div className="alert-banner">{statusError}</div>}

                {status === null && !statusError && (
                    <p className="helper-text">Loading…</p>
                )}

                {/* ---------------- Already enabled -> offer to disable ---------------- */}
                {status === "enabled" && !disabled && (
                    <div className="feature-card">
                        <div className="field-row" style={{ marginTop: 0 }}>
                            <h2 style={{ marginBottom: 0 }}>Currently enabled</h2>
                            <span className="status-pill allow">2FA ON</span>
                        </div>
                        <p className="helper-text">
                            Turning this off removes the code requirement at login. Confirm your password to continue.
                        </p>

                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            onClick={handleDisable}
                            className="btn-ghost"
                            disabled={disabling || !password}
                            style={{ marginTop: "18px", width: "auto" }}
                        >
                            {disabling ? "Disabling…" : "Disable two-factor authentication"}
                        </button>
                        {disableError && <div className="alert-banner">{disableError}</div>}
                    </div>
                )}

                {disabled && (
                    <div className="feature-card">
                        <div className="field-row" style={{ marginTop: 0 }}>
                            <h2 style={{ marginBottom: 0 }}>Two-factor authentication disabled</h2>
                            <span className="status-pill block">2FA OFF</span>
                        </div>
                        <p className="helper-text">Logins will no longer ask for a code.</p>
                        <button onClick={() => navigate("/dashboard")} style={{ marginTop: "18px" }}>Back to dashboard</button>
                    </div>
                )}

                {/* ---------------- Not enabled yet -> QR + verify ---------------- */}
                {status === "disabled" && !enabled && !setupData && (
                    <div className="feature-card">
                        <div className="field-row" style={{ marginTop: 0 }}>
                            <h2 style={{ marginBottom: 0 }}>Currently disabled</h2>
                            <span className="status-pill block">2FA OFF</span>
                        </div>
                        <p className="helper-text">
                            You'll need an authenticator app on your phone before you start.
                        </p>
                        <button onClick={beginSetup} disabled={starting} style={{ marginTop: "18px" }}>
                            {starting ? "Generating secret…" : "Enable two-factor authentication"}
                        </button>
                        {verifyError && <div className="alert-banner">{verifyError}</div>}
                    </div>
                )}

                {setupData && !enabled && (
                    <>
                        <div className="feature-card">
                            <h2>1. Scan this QR code</h2>
                            <p className="helper-text" style={{ marginTop: 0 }}>
                                Open your authenticator app and scan, or enter the key manually.
                            </p>
                            <div className="qr-frame">
                                <img src={setupData.qrCode} alt="TOTP setup QR code" width="180" height="180" />
                            </div>
                            <div className="manual-key">
                                <span className="helper-text" style={{ marginTop: 0 }}>Manual entry key</span>
                                <code className="mono manual-key-value">{setupData.manualEntryKey}</code>
                            </div>
                        </div>

                        <div className="feature-card">
                            <div className="otp-header">
                                <h2 style={{ marginBottom: 0 }}>2. Enter the 6-digit code</h2>
                                <CodeCountdownRing />
                            </div>
                            <p className="helper-text">Confirms the app is generating codes correctly before we switch 2FA on.</p>

                            <OtpInput
                                value={code}
                                onChange={setCode}
                                onComplete={confirmCode}
                                disabled={verifying}
                                autoFocus={false}
                            />

                            <button
                                onClick={() => confirmCode(code)}
                                disabled={verifying || code.length !== 6}
                                style={{ marginTop: "22px", width: "100%" }}
                            >
                                {verifying ? "Verifying…" : "Verify & enable"}
                            </button>

                            {verifyError && <div className="alert-banner">{verifyError}</div>}
                        </div>
                    </>
                )}

                {enabled && (
                    <div className="feature-card">
                        <div className="field-row" style={{ marginTop: 0 }}>
                            <h2 style={{ marginBottom: 0 }}>Two-factor authentication enabled</h2>
                            <span className="status-pill allow">2FA ON</span>
                        </div>
                        <p className="helper-text">
                            You'll be asked for a code from your authenticator app on every login from now on.
                        </p>
                        <button onClick={() => navigate("/dashboard")} style={{ marginTop: "18px" }}>Back to dashboard</button>
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}

export default TwoFactorSetup;
