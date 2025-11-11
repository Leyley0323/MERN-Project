import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { getAuthHeaders, isLoggedIn } from '../utils/auth';
import PageTitle from '../components/PageTitle';
import '../AuthPage.css';

export default function CreateListPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
      const response = await fetch(`${API_URL}/api/lists/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create list');
      }

      // Navigate to the new list detail page
      navigate(`/lists/${data.data._id}`);
    } catch (err: any) {
      console.error('Error creating list:', err);
      setError(err.message || 'Failed to create list. Please try again.');
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
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
          Create New Shopping List
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
              List Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '2px solid #333',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '16px',
                boxSizing: 'border-box',
              }}
              placeholder="e.g., Weekly Groceries"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              color: '#fff', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '2px solid #333',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
              placeholder="Add a description for your list..."
            />
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
              disabled={loading || !name.trim()}
              style={{
                backgroundColor: '#03b320ff',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                opacity: loading || !name.trim() ? 0.5 : 1,
              }}
            >
              {loading ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

