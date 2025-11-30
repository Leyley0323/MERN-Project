import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { getAuthHeaders, isLoggedIn } from '../utils/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../AuthPage.css';
import '../Dashboard.css';

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
    <div className="app-page">
      <Header />
      <main className="dashboard-page">
        <div className="dashboard-shell">
          <button className="back-link" onClick={() => navigate('/lists')}>
            ← Back to Lists
          </button>

          <section className="dashboard-card">
            <span className="section-eyebrow">Create</span>
            <h2 className="section-title">New Shopping List</h2>
            <p className="section-subtitle">
              Give your list a name, add an optional description, and invite your roommates or family.
            </p>

            {error && (
              <div className="alert-card" style={{ marginTop: '1.25rem', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: '1.5rem' }}>
              <div>
                <label className="section-eyebrow" style={{ letterSpacing: '0.2em' }}>
                  List name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  className="input-field"
                  placeholder="e.g., Weekly Groceries"
                />
              </div>

              <div>
                <label className="section-eyebrow" style={{ letterSpacing: '0.2em' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  className="textarea-field"
                  placeholder="Add context for everyone joining this list (optional)"
                />
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
                  disabled={loading || !name.trim()}
                >
                  {loading ? 'Creating…' : 'Create List'}
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

