function riskColor(score) {
    if (score >= 60) return "var(--block)";
    if (score >= 30) return "var(--verify)";
    return "var(--allow)";
}

// score: 0-100 risk score (higher = riskier)
function RiskGauge({ score = 0 }) {
    const clamped = Math.max(0, Math.min(100, score));
    const radius = 70;
    const circumference = Math.PI * radius; // half circle
    const offset = circumference - (clamped / 100) * circumference;
    const color = riskColor(clamped);

    return (
        <svg width="180" height="110" viewBox="0 0 180 110">
            <path
                d="M 20 100 A 70 70 0 0 1 160 100"
                fill="none"
                stroke="var(--border)"
                strokeWidth="14"
                strokeLinecap="round"
            />
            <path
                d="M 20 100 A 70 70 0 0 1 160 100"
                fill="none"
                stroke={color}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset .6s ease, stroke .3s ease" }}
            />
        </svg>
    );
}

export default RiskGauge;
