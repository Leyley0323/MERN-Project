import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { getAuthHeaders, isLoggedIn } from '../utils/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../AuthPage.css';

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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="auth-page" style={{ flex: 1 }}>
          <div className="auth-container">
            <div style={{ textAlign: 'center', color: '#fff', padding: '20px' }}>
              Loading your lists...
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div className="auth-page" style={{ flex: 1 }}>
        <div className="auth-container" style={{ maxWidth: '800px' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/')}
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
            ← Back to Home
          </button>
        </div>

        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>
          My Shopping Lists
        </h2>

        {/* Search Bar */}
        <div style={{ marginBottom: '25px' }}>
          <input
            type="text"
            placeholder="Search lists by name, description, code, or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #444',
              borderRadius: '8px',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#f7df05';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(247, 223, 5, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#444';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

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

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          justifyContent: 'center', 
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleCreateList}
            style={{
              backgroundColor: '#03b320ff',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f7df05ff')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#03b320ff')}
          >
            Create New List
          </button>
          <button
            onClick={handleJoinList}
            style={{
              backgroundColor: '#f7df05ff',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#03b320ff')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f7df05ff')}
          >
            Join List
          </button>
        </div>

        {lists.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#fff', 
            padding: '40px 20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '2px solid #333'
          }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              You don't have any lists yet.
            </p>
            <p style={{ fontSize: '14px', color: '#aaa' }}>
              Create a new list or join an existing one to get started!
            </p>
          </div>
        ) : filteredLists.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#fff', 
            padding: '40px 20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '2px solid #333'
          }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>
              No lists found matching "{searchQuery}"
            </p>
            <p style={{ fontSize: '14px', color: '#aaa' }}>
              Try a different search term
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {filteredLists.map((list) => (
              <div
                key={list._id}
                onClick={() => handleViewList(list._id)}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '2px solid #333',
                  borderRadius: '8px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#03b320ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(3, 179, 32, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{ 
                  color: '#f7df05ff', 
                  marginTop: 0, 
                  marginBottom: '10px',
                  fontSize: '20px'
                }}>
                  {list.name}
                </h3>
                {list.description && (
                  <p style={{ 
                    color: '#aaa', 
                    fontSize: '14px', 
                    marginBottom: '10px' 
                  }}>
                    {list.description}
                  </p>
                )}
                <div style={{ color: '#fff', fontSize: '14px', marginBottom: '8px' }}>
                  <strong>Code:</strong> {list.code}
                </div>
                <div style={{ color: '#fff', fontSize: '14px', marginBottom: '8px' }}>
                  <strong>Created by:</strong> {list.creatorName}
                </div>
                <div style={{ color: '#03b320ff', fontSize: '14px' }}>
                  {list.purchasedItems} of {list.totalItems} items purchased
                </div>
                <div style={{ 
                  color: '#888', 
                  fontSize: '12px', 
                  marginTop: '10px',
                  fontStyle: 'italic'
                }}>
                  Updated {new Date(list.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

