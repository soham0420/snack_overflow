import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";


function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    async function handleSubmit(e) {

        e.preventDefault();

        try {

            const response = await api.post("/auth/login", {

                email,
                password,

            });

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            localStorage.setItem(
                "security",
                JSON.stringify(response.data.security)
            );

            setResult(response.data.security);
            if(response.data.security.riskScore <= 65){

            navigate("/security-check");

            }

            else{

            navigate("/dashboard");

            }

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

                <h2>Login</h2>

                <form onSubmit={handleSubmit}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    required
                />

                    <br /><br />

                <Link to="/forgot-password">

                    Forgot Password?

                </Link>

                    <br /><br />

                   

                    <br /><br />

                    <button type="submit">

                        Login

                    </button>

                </form>


            </div>

        </>

    );

}

export default Login;