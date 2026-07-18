import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Register() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [securityQuestion,setSecurityQuestion]=useState("");
    const [securityAnswer,setSecurityAnswer]=useState("");
    const [result, setResult] = useState(null);

    async function handleSubmit(e) {

        e.preventDefault();

        try {

            const response = await api.post("/auth/register", {

                email,
                password,
                securityQuestion,
                securityAnswer
            });

            setResult(response.data.risk);

        }

        catch (error) {

            console.error(error);

            alert("Unable to connect to backend");

        }

    }

    return (

        <>
            <Navbar />

            <div className="container">

                <h2>Create Account</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <br /><br />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <br /><br />
                    
                    <label>Security Question</label>

                    <select
                    required
                        value={securityQuestion}
                        onChange={(e) => setSecurityQuestion(e.target.value)}
                    >

                    <option value="">Select Question</option>

                    <option value="teacher">
                    Favourite Teacher's Name
                    </option>

                    <option value="pet">
                    First Pet's Name
                    </option>

                    <option value="school">
                    First School
                    </option>

                    <option value="city">
                    Birth City
                    </option>

                    </select>


                    <br /><br />

                    <label>Security Answer</label>

                    <input
                    required
                    type="text"
                    value={securityAnswer}
                    onChange={(e)=>setSecurityAnswer(e.target.value)}
                    placeholder="Enter Answer"
                    />

                    <br /><br />

                    <button type="submit">

                        Register

                    </button>

                </form>

                {result && (

                    <div className="feature-card">

                        <h2>✅ Registration Successful</h2>

                        <hr />

                        <h3>Risk Score</h3>

                        <h2>{result.riskScore}</h2>

                        <h3>Risk Level: {result.riskLevel}</h3>

                        <h4>Reasons</h4>

                        <ul>

                            {result.reasons.map((reason, index) => (

                                <li key={index}>{reason}</li>

                            ))}

                        </ul>

                    </div>

                )}

            </div>

        </>

    );

}

export default Register;