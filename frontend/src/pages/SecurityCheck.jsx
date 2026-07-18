import { useState } from "react";

import { useNavigate } from "react-router-dom";

function SecurityCheck(){

const navigate=useNavigate();

const [answer,setAnswer]=useState("");

function verify(){

// backend teammate API

navigate("/dashboard");

}

return(

<div className="container">

<h2>Additional Verification</h2>

<p>

Please answer your security question.

</p>

<input
required
placeholder="Security Answer"

value={answer}

onChange={(e)=>setAnswer(e.target.value)}

/>

<button onClick={verify}>

Verify

</button>

</div>

);

}

export default SecurityCheck;