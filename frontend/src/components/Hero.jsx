import { Link } from "react-router-dom";

function Hero() {
    return (
        <section className="hero">
            <div className="hero-copy">
                <span className="hero-eyebrow">Adaptive login protection</span>

                <h1>Every login gets a risk score before it gets a session.</h1>

                <p>
                    SecureAuth AI checks the device, location, and behavior behind
                    every sign-in attempt, then decides in real time whether to
                    allow it, ask for extra verification, or block it outright.
                </p>

                <div className="hero-buttons">
                    <Link to="/register"><button>Create an account</button></Link>
                    <Link to="/login"><button className="btn-ghost">Login</button></Link>
                </div>
            </div>

            <div className="scan-panel" aria-hidden="true">
                <div className="scan-panel-header">
                    <span>LOGIN_ATTEMPT.log</span>
                    <span>LIVE</span>
                </div>

                <div className="scan-row"><span>device</span><span>unrecognized</span></div>
                <div className="scan-row"><span>location</span><span>new region</span></div>
                <div className="scan-row"><span>network</span><span>VPN detected</span></div>
                <div className="scan-row"><span>risk_score</span><span style={{ color: "var(--verify)" }}>52 / 100</span></div>
                <div className="scan-row"><span>decision</span><span className="status-pill verify">VERIFY</span></div>
            </div>
        </section>
    );
}

export default Hero;
