import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";

function Home() {
    return (
        <>
            <Navbar />
            <Hero />

            <div className="features">
                <FeatureCard
                    tag="REGISTER"
                    icon="🛡"
                    title="Registration screening"
                    description="Flags disposable emails, bot-like typing speed, and failed CAPTCHAs before an account is even created."
                />

                <FeatureCard
                    tag="LOGIN"
                    icon="🔍"
                    title="Login risk scoring"
                    description="Scores every sign-in on device trust, location, VPN use, and time of day — then decides: allow, verify, or block."
                />

                <FeatureCard
                    tag="DASHBOARD"
                    icon="📊"
                    title="Security dashboard"
                    description="Shows your live risk score, the reasons behind it, and plain-English recommendations to stay protected."
                />
            </div>

            <Footer />
        </>
    );
}

export default Home;
