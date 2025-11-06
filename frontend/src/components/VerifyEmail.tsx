import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function VerifyEmail()
{
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message,setMessage] = React.useState('Verifying email...');
  const [status,setStatus] = React.useState<'verifying' | 'success' | 'error'>('verifying');

  React.useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setMessage('Invalid verification link');
      setStatus('error');
      return;
    }

    verifyEmail(token);
  }, []);

  async function verifyEmail(token: string) : Promise<void>
  {
    var obj = { token: token };
    var js = JSON.stringify(obj);

    try
    {    
        const response = await fetch('http://localhost:5001/api/verify-email',
            {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

        var res = JSON.parse(await response.text());

        if( res.error.length > 0 )
        {
            setMessage('Verification failed: ' + res.error);
            setStatus('error');
        }
        else
        {
            setMessage('Email verified successfully! You can now log in.');
            setStatus('success');
            setTimeout(() => {
              navigate('/login');
            }, 2000);
        }
    }
    catch(error:any)
    {
        setMessage('Error: ' + error.toString());
        setStatus('error');
    }    
  }

    return(
      <div id="verifyDiv">
        <span id="inner-title">EMAIL VERIFICATION</span><br />
        <p>{message}</p>
        {status === 'success' && (
          <p>Redirecting to login page...</p>
        )}
        {status === 'error' && (
          <button className="buttons" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        )}
     </div>
    );
};

export default VerifyEmail;
