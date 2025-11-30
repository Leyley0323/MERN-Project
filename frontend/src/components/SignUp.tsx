import React from 'react';
import { Link } from 'react-router-dom';
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

    const isSuccess = message && message.includes('Account created');

    return(
      <div id="signupDiv">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span id="inner-title">Create Your Account</span>
          <p style={{ 
            color: 'var(--text-subtle)', 
            fontSize: '0.95rem', 
            marginTop: '0.5rem',
            marginBottom: 0 
          }}>
            Join SharedCart and start organizing your shopping lists
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
              id="firstName" 
              placeholder="First Name" 
              value={firstName} 
              onChange={handleFirstNameChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input 
              type="text" 
              id="lastName" 
              placeholder="Last Name" 
              value={lastName} 
              onChange={handleLastNameChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <input 
              type="email" 
              id="email" 
              placeholder="Email" 
              value={email} 
              onChange={handleEmailChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input 
              type="text" 
              id="login" 
              placeholder="Username" 
              value={login} 
              onChange={handleLoginChange}
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
              id="password" 
              placeholder="Password" 
              value={password} 
              onChange={handlePasswordChange}
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
            <span id="signupResult">{message}</span>
          </div>
        )}

        <input 
          type="submit" 
          id="signupButton" 
          className="buttons" 
          value="Create Account"
          onClick={doSignup}
        />

        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <span id="signuptitle">Already have an account? </span>
          <Link to="/login" style={{ 
            fontWeight: 600,
            marginLeft: '4px'
          }}>
            Sign In
          </Link>
        </div>
     </div>
    );
};

export default Signup;