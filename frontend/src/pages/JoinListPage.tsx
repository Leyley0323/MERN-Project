import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { getAuthHeaders, isLoggedIn } from '../utils/auth';
import PageTitle from '../components/PageTitle';
import '../AuthPage.css';

export default function JoinListPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is logged in
  if (!isLoggedIn()) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/lists/join`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ code: code.toUpperCase().trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to join list');
      }

      // Navigate to the joined list detail page
      navigate(`/lists/${data.data._id}`);
    } catch (err: any) {
      console.error('Error joining list:', err);
      setError(err.message || 'Failed to join list. Please check the code and try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/lists');
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '500px' }}>
        <PageTitle />
        
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/lists')}
            style={{
              backgroundColor: '#666',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← Back to Lists
          </button>
        </div>

        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
          Join Shopping List
        </h2>

        {error && (
          <div style={{ 
            color: '#ff4444', 
            textAlign: 'center', 
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#330000',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              color: '#fff', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              List Code *
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              maxLength={8}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '2px solid #333',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '20px',
                letterSpacing: '4px',
                textAlign: 'center',
                textTransform: 'uppercase',
                boxSizing: 'border-box',
              }}
              placeholder="ABC123"
            />
            <p style={{ 
              color: '#aaa', 
              fontSize: '14px', 
              marginTop: '8px',
              textAlign: 'center'
            }}>
              Enter the 6-8 character code shared by the list creator
            </p>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            justifyContent: 'center',
            marginTop: '30px'
          }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{
                backgroundColor: '#666',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                opacity: loading ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              style={{
                backgroundColor: '#f7df05ff',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                opacity: loading || !code.trim() ? 0.5 : 1,
              }}
            >
              {loading ? 'Joining...' : 'Join List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

