import React from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [email, setEmail] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [message, setMessage] = React.useState('');
    const navigate = useNavigate();

    async function doSignup(event: any) {
    event.preventDefault();
    const obj = { username, password, email };
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
        setMessage('Signup failed');
    }
    }

    function doLogin(event: any): void {
        event.preventDefault();
        navigate('/login');
    }

    // add first name, last name etc
    return (
    <div id="signupdiv">
        <h2>Create Account</h2>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}/>
        <br />
        <input type="submit" id="SignUpButton" className="buttons" value = "SignUp" onClick={doLogin} />
        <p>{message}</p>
    </div>
    );
}

export default Signup;
