import React from 'react';
import { API_URL } from '../config/api';

function Signup()
{
  const [message,setMessage] = React.useState('');
  const [firstName,setFirstName] = React.useState('');
  const [lastName,setLastName] = React.useState('');
  const [email,setEmail] = React.useState('');
  const [login,setLogin] = React.useState('');
  const [password,setPassword] = React.useState('');

  async function doSignup(event:any) : Promise<void>
  {
    event.preventDefault();
    setMessage(''); // Clear previous messages

    // Validate input
    if (!firstName || !lastName || !email || !login || !password) {
      setMessage('Please fill in all fields');
      return;
    }

    var obj = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      login: login,
      password: password
    };
    var js = JSON.stringify(obj);

    try
    {    
        const response = await fetch(`${API_URL}/api/signup`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

        // Check if response is OK
        if (!response.ok) {
          // Try to parse error response
          try {
            const errorText = await response.text();
            const errorRes = JSON.parse(errorText);
            setMessage('Signup failed: ' + (errorRes.error || `Server error (${response.status})`));
          } catch {
            setMessage(`Signup failed: Server error (${response.status} ${response.statusText})`);
          }
          return;
        }

        const responseText = await response.text();
        var res = JSON.parse(responseText);

        if( res.id <= 0 )
        {
            setMessage('Signup failed: ' + (res.error || 'Unknown error'));
        }
        else
        {
            setMessage('Account created! Please check your email to verify your account before logging in.');
            // Clear form
            setFirstName('');
            setLastName('');
            setEmail('');
            setLogin('');
            setPassword('');
        }
    }
    catch(error:any)
    {
        console.error('Signup error:', error);
        setMessage('Signup failed: ' + (error.message || error.toString() || 'Network error. Please check your connection.'));
    }    
  }

  function handleFirstNameChange( e: any ) : void
  {
    setFirstName( e.target.value );
  }

  function handleLastNameChange( e: any ) : void
  {
    setLastName( e.target.value );
  }

  function handleEmailChange( e: any ) : void
  {
    setEmail( e.target.value );
  }

  function handleLoginChange( e: any ) : void
  {
    setLogin( e.target.value );
  }

  function handlePasswordChange( e: any ) : void
  {
    setPassword( e.target.value );
  }

    return(
      <div id="signupDiv">
        <span id="inner-title">CREATE ACCOUNT</span><br />
        <input type="text" id="firstName" placeholder="First Name" 
          value={firstName} onChange={handleFirstNameChange} /><br />
        <input type="text" id="lastName" placeholder="Last Name" 
          value={lastName} onChange={handleLastNameChange} /><br />
        <input type="email" id="email" placeholder="Email" 
          value={email} onChange={handleEmailChange} /><br />
        <input type="text" id="login" placeholder="Username" 
          value={login} onChange={handleLoginChange} /><br />
        <input type="password" id="password" placeholder="Password" 
          value={password} onChange={handlePasswordChange} /><br />
        <input type="submit" id="signupButton" className="buttons" value = "Sign Up"
          onClick={doSignup} />
        <span id="signupResult">{message}</span>
     </div>
    );
};

export default Signup;