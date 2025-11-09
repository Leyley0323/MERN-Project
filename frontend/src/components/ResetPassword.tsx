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

    return(
      <div id="resetPasswordDiv">
        <span id="inner-title">RESET PASSWORD</span><br />
        <input type="password" id="password" placeholder="New Password" 
          value={password} onChange={handlePasswordChange} /><br />
        <input type="password" id="confirmPassword" placeholder="Confirm Password" 
          value={confirmPassword} onChange={handleConfirmPasswordChange} /><br />
        <input type="submit" id="resetButton" className="buttons" value = "Reset Password"
          onClick={doResetPassword} />
        <span id="resetResult">{message}</span>
     </div>
    );
};

export default ResetPassword;
