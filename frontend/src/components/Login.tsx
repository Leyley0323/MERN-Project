import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { API_URL } from '../config/api';

function Login()
{
  const [message,setMessage] = React.useState('');
  const [showResend,setShowResend] = React.useState(false);
  const [loginName,setLoginName] = React.useState('');
  const [loginPassword,setPassword] = React.useState('');

  async function doLogin(event:any) : Promise<void>
  {
    event.preventDefault();

    var obj = {login:loginName,password:loginPassword};
    var js = JSON.stringify(obj);

    try
    {    
        const response = await fetch(`${API_URL}/api/login`,
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
      const res = await fetch(`${API_URL}/api/resend-verification`, {
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

    const isSuccess = message && (message.includes('resent') || message.includes('Verification email'));

    return(
      <div id="loginDiv">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span id="inner-title">Welcome Back</span>
          <p style={{ 
            color: 'var(--text-subtle)', 
            fontSize: '0.95rem', 
            marginTop: '0.5rem',
            marginBottom: 0 
          }}>
            Sign in to access your shopping lists
          </p>
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input 
              type="text" 
              id="loginName" 
              placeholder="Username or Email" 
              value={loginName}
              onChange={handleSetLoginName}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input 
              type="password" 
              id="loginPassword" 
              placeholder="Password" 
              value={loginPassword}
              onChange={handleSetPassword}
              className="form-input"
            />
          </div>
        </div>

        {message && (
          <div className={`message-box ${isSuccess ? 'success' : 'error'}`}>
            {isSuccess ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            <span id="loginResult">{message}</span>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <Link 
            to="/forgot-password" 
            style={{
              fontSize: '0.9rem', 
              color: 'var(--text-subtle)',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-subtle)'}
          >
            Forgot Password?
          </Link>
        </div>

        <input 
          type="submit" 
          id="loginButton" 
          className="buttons" 
          value="Sign In"
          onClick={doLogin} 
        />

        {showResend && (
          <button 
            className="buttons" 
            style={{
              marginTop: '0.75rem',
              background: 'rgba(3, 216, 127, 0.2)',
              border: '1px solid rgba(3, 216, 127, 0.4)',
              color: 'var(--accent)'
            }}
            onClick={resendVerification}
          >
            Resend Verification Email
          </button>
        )}

        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <span id="signuptitle">Don't have an account? </span>
          <Link 
            to="/signup" 
            style={{ 
              fontWeight: 600,
              marginLeft: '4px'
            }}
          >
            Create Account
          </Link>
        </div>
        
    </div>
    );
};

export default Login;
