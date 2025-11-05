import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import logo from "../assets/logo.png";

function Signup() {
    const [email, setEmail] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [firstname, setFirstName] = React.useState('');
    const [lastname, setLastName] = React.useState('');
    const navigate = useNavigate();

    async function doSignup(event: any) {
    event.preventDefault();
    const obj = { username, password, email, firstname, lastname };
    const js = JSON.stringify(obj);

    try {
        const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
    });

        const res = JSON.parse(await response.text());
        setMessage(res.message);
    } catch (e) {
        console.error(e);
        setMessage('Signup failed please try again later');
    }
    }
    function doLogin(event: any): void {
        event.preventDefault();
        navigate('/login');
    }
    

    return (
        <div id="signupdiv">
        <h2>Sign Up to Start Shopping</h2>
        <input type="text" placeholder="First Name" onChange={(e) => setFirstName(e.target.value)} />
        <input type="text" placeholder="Last Name" onChange={(e) => setLastName(e.target.value)} />
        <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}/>
        <br />
        <input type="submit" id="SignUpButton" className="buttons" value = "Sign Up" onClick={doSignup} />
        <p>{message}</p>

        <span id="loginLink"> Already have an Account? </span> <br/>
        <input type="submit" className="buttons" value="Log In" onClick={doLogin} />
        
    </div>
    );
}

export default Signup;
