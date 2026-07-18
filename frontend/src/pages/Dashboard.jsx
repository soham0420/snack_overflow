import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Dashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const security = JSON.parse(localStorage.getItem("security"));

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

                <div className="container">
                    <h2>No Security Data Found</h2>
                    <p>Please login first.</p>
                </div>
            </>
        );
    }

    return (

        <>
            <Navbar />

            <div className="container">

                <h1>🔐 SecureAuth AI Dashboard</h1>

                <div className="feature-card">

                    <h2>Welcome</h2>

                    <p>{user.email}</p>

                </div>

                <div className="feature-card">

                    <h2>Security Score</h2>

                    <h1>{100 - security.riskScore}/100</h1>

                    <h3>Risk Level: {security.riskLevel}</h3>

                    <h3>Decision: {security.decision}</h3>

                </div>

                <div className="feature-card">

                    <h2>Reasons</h2>

                    <ul>

                        {security.reasons.length > 0 ?

                            security.reasons.map((reason, index) => (

                                <li key={index}>{reason}</li>

                            ))

                            :

                            <li>No threats detected ✅</li>

                        }

                    </ul>

                </div>

                <div className="feature-card">

                    <h2>Security Insights</h2>

                    <ul>

                        {security.insights.map((item, index) => (

                            <li key={index}>{item}</li>

                        ))}

                    </ul>

                </div>

                <div className="feature-card">

                    <h2>Recommendations</h2>

                    <ul>

                        {security.recommendations.map((item, index) => (

                            <li key={index}>{item}</li>

                        ))}

                    </ul>

                </div>

                <br />

                <button onClick={logout}>

                    Logout

                </button>

            </div>

        </>

    );

}

export default Dashboard;