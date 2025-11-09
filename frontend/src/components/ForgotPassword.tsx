import React from 'react';
import { API_URL } from '../config/api';

function ForgotPassword()
{
  const [message,setMessage] = React.useState('');
  const [email,setEmail] = React.useState('');

  async function doRequestReset(event:any) : Promise<void>
  {
    event.preventDefault();

    var obj = { email: email };
    var js = JSON.stringify(obj);

    try
    {    
        const response = await fetch(`${API_URL}/api/reset-password-request`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

        var res = JSON.parse(await response.text());

        if( res.error.length > 0 )
        {
            setMessage('Error: ' + res.error);
        }
        else
        {
            setMessage('Password reset email sent! Please check your inbox.');
            setEmail('');
        }
    }
    catch(error:any)
    {
        setMessage('Error: ' + error.toString());
    }    
  }

  function handleEmailChange( e: any ) : void
  {
    setEmail( e.target.value );
  }

    return(
      <div id="forgotPasswordDiv">
        <span id="inner-title">RESET PASSWORD</span><br />
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        <input type="email" id="email" placeholder="Email" 
          value={email} onChange={handleEmailChange} /><br />
        <input type="submit" id="resetButton" className="buttons" value = "Send Reset Link"
          onClick={doRequestReset} />
        <span id="resetResult">{message}</span>
     </div>
    );
};

export default ForgotPassword;
