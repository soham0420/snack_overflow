import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";

function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <div className="features">

        <FeatureCard
          icon="🛡"
          title="AI Registration"
          description="Checks disposable emails, CAPTCHA and bot-like behaviour."
        />

        <FeatureCard
          icon="🔍"
          title="Login Risk"
          description="Detect suspicious logins using AI-powered analysis."
        />

        <FeatureCard
          icon="📊"
          title="Security Dashboard"
          description="View alerts, recommendations and account security insights."
        />

      </div>
    </>
  );
}

export default Home;