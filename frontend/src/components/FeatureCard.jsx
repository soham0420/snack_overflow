function FeatureCard({ tag, title, description, icon }) {
    return (
        <div className="feature-card">
            {tag && <span className="feature-tag">{tag}</span>}
            <div className="feature-icon">{icon}</div>

            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

export default FeatureCard;
