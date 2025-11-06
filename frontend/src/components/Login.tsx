import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

function Login()
{
  const [message,setMessage] = React.useState('');
  const [showResend,setShowResend] = React.useState(false);
  const [loginName,setLoginName] = React.useState('');
  const [loginPassword,setPassword] = React.useState('');
  const navigate = useNavigate();

  async function doLogin(event:any) : Promise<void>
  {
    event.preventDefault();

    var obj = {login:loginName,password:loginPassword};
    var js = JSON.stringify(obj);

    try
    {    
        const response = await fetch('http://localhost:5001/api/login',
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

        var res = JSON.parse(await response.text());

        if( res.id <= 0 )
        {
            setMessage(res.error || 'User/Password combination incorrect');
        }
        else if( !res.emailVerified )
        {
            setMessage('Please verify your email before logging in. Check your inbox for the verification link.');
            setShowResend(true);
        }
        else
        {
            var user = {firstName:res.firstName,lastName:res.lastName,id:res.id}
            localStorage.setItem('user_data', JSON.stringify(user));

            setMessage('');
            window.location.href = '/';
        }
    }
    catch(error:any)
    {
        alert(error.toString());
        return;
    }    
  }

  async function resendVerification(): Promise<void>
  {
    if (!loginName) {
      setMessage('Enter your email, then click Resend Verification.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5001/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginName })
      });
      const body = JSON.parse(await res.text());
      if (body.error && body.error.length > 0) {
        setMessage('Resend failed: ' + body.error);
      } else {
        setMessage('Verification email resent. Check your inbox/spam.');
      }
    } catch (e:any) {
      setMessage('Resend failed: ' + e.toString());
    }
  }

  function handleSetLoginName( e: any ) : void
  {
    setLoginName( e.target.value );
  }

  function handleSetPassword( e: any ) : void
  {
    setPassword( e.target.value );
  }

    function doSignUp(event: any): void {
      event.preventDefault();
      navigate('/signup');
    }

    return(
      <div id="loginDiv">
        <span id="inner-title">Sign in to Start Shoping</span><br />
        <input type="text" id="loginName" placeholder="Username or Email" 
          onChange={handleSetLoginName} /><br />
        <input type="password" id="loginPassword" placeholder="Password" 
          onChange={handleSetPassword} /><br />
        <input type="submit" id="loginButton" className="buttons" value = "LOG IN"
          onClick={doLogin} />
      <span id="loginResult">{message}</span>
      <br />
      <Link to="/forgot-password" style={{fontSize: '14px', color: '#666', textDecoration: 'none'}}>
        Forgot Password?
      </Link>
      {showResend && (
        <>
          <br />
          <button className="buttons" style={{marginTop: '8px'}} onClick={resendVerification}>Resend Verification</button>
        </>
      )}
      <br /><br />
      <span id="signuptitle">Don't Have An Account? </span>
      <input type="submit" id="CreateAccountButton" className="buttons" value = "CREATE ACCOUNT"
          onClick={doSignUp} />
        
    </div>
    );
};

export default Login;
