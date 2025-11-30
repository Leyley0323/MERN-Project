import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { getAuthHeaders, isLoggedIn } from '../utils/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../AuthPage.css';
import '../Dashboard.css';

interface ShoppingList {
  _id: string;
  name: string;
  description: string;
  code: string;
  creatorName: string;
  totalItems: number;
  purchasedItems: number;
  updatedAt: string;
}

export default function ListsPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [filteredLists, setFilteredLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    fetchLists();
  }, [navigate]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/api/lists`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch lists');
      }

      const fetchedLists = data.data || [];
      setLists(fetchedLists);
      setFilteredLists(fetchedLists);
    } catch (err: any) {
      console.error('Error fetching lists:', err);
      setError(err.message || 'Failed to load lists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter lists based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLists(lists);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = lists.filter(list => 
      list.name.toLowerCase().includes(query) ||
      list.description.toLowerCase().includes(query) ||
      list.code.toLowerCase().includes(query) ||
      list.creatorName.toLowerCase().includes(query)
    );
    setFilteredLists(filtered);
  }, [searchQuery, lists]);

  const handleViewList = (listId: string) => {
    navigate(`/lists/${listId}`);
  };

  const handleCreateList = () => {
    navigate('/lists/create');
  };

  const handleJoinList = () => {
    navigate('/lists/join');
  };

  if (loading) {
    return (
      <div className="app-page">
        <Header />
        <main className="dashboard-page">
          <div className="dashboard-shell">
            <div className="dashboard-card">
              <span className="section-eyebrow">Syncing</span>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
                Loading your lists…
              </h2>
              <p className="section-subtitle">Hang tight while we fetch the latest updates.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-page">
      <Header />
      <main className="dashboard-page">
        <div className="dashboard-shell">
          <button className="back-link" onClick={() => navigate('/')}>
            ← Back to Home
          </button>

          <section className="dashboard-card">
            <div className="dashboard-header">
              <div>
                <span className="section-eyebrow">Shared Lists</span>
                <h2 className="section-title">My Shopping Lists</h2>
                <p className="section-subtitle">
                  Create, join, and manage collaborative lists with real-time updates.
                </p>
              </div>
              <div className="dashboard-actions">
                <button className="btn btn-secondary" onClick={handleJoinList}>
                  Join List
                </button>
                <button className="btn btn-primary" onClick={handleCreateList}>
                  Create New List
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search lists by name, description, code, or creator…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {error && (
              <div className="alert-card" style={{ marginTop: '1.25rem', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            {lists.length === 0 ? (
              <div className="alert-card empty-state" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-strong)' }}>No lists yet</h3>
                <p>
                  Start by creating a new list or join an existing one using a share code.
                </p>
              </div>
            ) : filteredLists.length === 0 ? (
              <div className="alert-card empty-state" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-strong)' }}>
                  Nothing matched “{searchQuery}”
                </h3>
                <p>Try a different search term or clear the filter.</p>
              </div>
            ) : (
              <div className="list-grid" style={{ marginTop: '1.5rem' }}>
                {filteredLists.map((list) => (
                  <article
                    key={list._id}
                    className="list-card"
                    onClick={() => handleViewList(list._id)}
                  >
                    <small>List Code • {list.code}</small>
                    <h3>{list.name}</h3>
                    {list.description && <p>{list.description}</p>}
                    <div className="list-meta">
                      <span>Creator · {list.creatorName}</span>
                      <span className="progress-pill">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 6v6l4 2"></path>
                        </svg>
                        {list.purchasedItems} / {list.totalItems} purchased
                      </span>
                    </div>
                    <div className="timestamp">
                      Updated {new Date(list.updatedAt).toLocaleDateString()}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

