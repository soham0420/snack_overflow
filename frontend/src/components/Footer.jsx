function Footer() {
    return (
        <footer style={{
            borderTop: "1px solid var(--border-soft)",
            padding: "28px 6%",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            color: "var(--text-faint)",
            fontSize: "13px",
            fontFamily: "var(--font-mono)"
        }}>
            <span>SecureAuth AI — built for Snack Overflow</span>
            <span>Risk engine · JWT auth · Adaptive verification</span>
        </footer>
    );
}

export default Footer;
