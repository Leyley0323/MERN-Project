import React from 'react';

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
        const response = await fetch('http://localhost:5001/api/signup',
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

        var res = JSON.parse(await response.text());

        if( res.id <= 0 )
        {
            setMessage('Signup failed: ' + res.error);
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
        setMessage(error.toString());
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