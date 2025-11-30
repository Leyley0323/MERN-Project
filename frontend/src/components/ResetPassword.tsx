import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

function ResetPassword()
{
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message,setMessage] = React.useState('');
  const [password,setPassword] = React.useState('');
  const [confirmPassword,setConfirmPassword] = React.useState('');

  async function doResetPassword(event:any) : Promise<void>
  {
    event.preventDefault();

    const token = searchParams.get('token');
    
    if (!token) {
      setMessage('Invalid reset link');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    var obj = { token: token, newPassword: password };
    var js = JSON.stringify(obj);

    try
    {    
        const response = await fetch(`${API_URL}/api/reset-password`,
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

        var res = JSON.parse(await response.text());

        if( res.error.length > 0 )
        {
            setMessage('Error: ' + res.error);
        }
        else
        {
            setMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => {
              navigate('/login');
            }, 2000);
        }
    }
    catch(error:any)
    {
        setMessage('Error: ' + error.toString());
    }    
  }

  function handlePasswordChange( e: any ) : void
  {
    setPassword( e.target.value );
  }

  function handleConfirmPasswordChange( e: any ) : void
  {
    setConfirmPassword( e.target.value );
  }

    const isSuccess = message && message.includes('successfully');

    return(
      <div id="resetPasswordDiv">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span id="inner-title">Reset Your Password</span>
          <p style={{ 
            color: 'var(--text-subtle)', 
            fontSize: '0.95rem', 
            marginTop: '0.5rem',
            marginBottom: 0 
          }}>
            Enter your new password below
          </p>
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
              placeholder="New Password" 
              value={password} 
              onChange={handlePasswordChange}
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
              id="confirmPassword" 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={handleConfirmPasswordChange}
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
            <span id="resetResult">{message}</span>
          </div>
        )}

        <input 
          type="submit" 
          id="resetButton" 
          className="buttons" 
          value="Reset Password"
          onClick={doResetPassword} 
        />
     </div>
    );
};

export default ResetPassword;
