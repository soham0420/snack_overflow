import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">

      <h1>SecureAuth AI</h1>

      <p>
        AI Powered Authentication &
        Intelligent Login Protection
      </p>

      <div className="hero-buttons">

        <Link to="/register">
          <button>Get Started</button>
        </Link>

        <Link to="/login">
          <button>Login</button>
        </Link>

      </div>

    </section>
  );
}

export default Hero;