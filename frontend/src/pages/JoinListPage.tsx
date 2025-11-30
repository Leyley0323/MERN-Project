import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { getAuthHeaders, isLoggedIn } from '../utils/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../AuthPage.css';
import '../Dashboard.css';

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
    <div className="app-page">
      <Header />
      <main className="dashboard-page">
        <div className="dashboard-shell">
          <button className="back-link" onClick={() => navigate('/lists')}>
            ← Back to Lists
          </button>

          <section className="dashboard-card">
            <span className="section-eyebrow">Join</span>
            <h2 className="section-title">Enter a share code</h2>
            <p className="section-subtitle">
              Paste the 6–8 character code you received to jump directly into a shared list.
            </p>

            {error && (
              <div className="alert-card" style={{ marginTop: '1.25rem', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: '1.5rem' }}>
              <div>
                <label className="section-eyebrow" style={{ letterSpacing: '0.2em' }}>
                  List code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  maxLength={8}
                  className="input-field"
                  style={{
                    textAlign: 'center',
                    letterSpacing: '0.6rem',
                    textTransform: 'uppercase',
                    fontSize: '1.4rem',
                    fontWeight: 600,
                  }}
                  placeholder="ABC123"
                />
                <p style={{ color: 'var(--text-subtle)', textAlign: 'center', marginTop: '0.4rem' }}>
                  Looks like: <strong>SHR123</strong> or <strong>GROCER1</strong>
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={loading}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !code.trim()}
                >
                  {loading ? 'Joining…' : 'Join List'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

