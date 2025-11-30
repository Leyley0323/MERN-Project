import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../config/api';
import { getAuthHeaders, isLoggedIn } from '../utils/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../AuthPage.css';
import '../Dashboard.css';

interface ListItem {
  _id: string;
  name: string;
  quantity: number;
  weight?: number | null;
  weightUnit?: string | null;
  purchased: boolean;
  purchasedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  purchasedAt?: string;
  addedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  addedByName: string;
}

interface ListDetail {
  _id: string;
  name: string;
  description: string;
  code: string;
  creatorName: string;
  isCreator: boolean;
  members: Array<{
    _id: string;
    firstName: string;
    lastName: string;
  }>;
  items: ListItem[];
  totalItems: number;
  purchasedItems: number;
  updatedAt: string;
}

export default function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>();
  const [list, setList] = useState<ListDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [addingItem, setAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingQuantity, setEditingQuantity] = useState('');
  const [editingWeight, setEditingWeight] = useState('');
  const [editingWeightUnit, setEditingWeightUnit] = useState('');
  const [editingListName, setEditingListName] = useState(false);
  const [listNameValue, setListNameValue] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<'all' | 'unpurchased' | 'purchased'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    if (listId) {
      fetchList();
      // Start polling every 5 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchList(true); // Silent fetch (don't show loading)
      }, 5000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [listId, navigate]);

  const fetchList = async (silent = false) => {
    if (!listId) return;

    try {
      if (!silent) {
        setLoading(true);
      }
      setError('');

      const response = await fetch(`${API_URL}/api/lists/${listId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 403 || response.status === 404) {
          throw new Error(data.error || 'List not found or access denied');
        }
        throw new Error(data.error || 'Failed to fetch list');
      }

      setList(data.data);
      setListNameValue(data.data.name);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching list:', err);
      if (!silent) {
        setError(err.message || 'Failed to load list. Please try again.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listId || !newItemName.trim()) return;

    try {
      setAddingItem(true);
      setError('');

      const body: any = {
        name: newItemName.trim(),
        quantity: parseInt(newItemQuantity) || 1,
      };

      // Add weight if provided
      const weightInputEl = document.getElementById('newItemWeight') as HTMLInputElement;
      const weightUnitInputEl = document.getElementById('newItemWeightUnit') as HTMLSelectElement;
      const weightValue = weightInputEl?.value;
      const weightUnitValue = weightUnitInputEl?.value;
      if (weightValue && weightValue.trim() && !isNaN(parseFloat(weightValue))) {
        body.weight = parseFloat(weightValue);
        body.weightUnit = weightUnitValue || 'lbs';
      }

      const response = await fetch(`${API_URL}/api/lists/${listId}/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add item');
      }

      setNewItemName('');
      setNewItemQuantity('1');
      if (weightInputEl) weightInputEl.value = '';
      if (weightUnitInputEl) weightUnitInputEl.value = 'lbs';
      fetchList(); // Refresh list
    } catch (err: any) {
      console.error('Error adding item:', err);
      setError(err.message || 'Failed to add item. Please try again.');
    } finally {
      setAddingItem(false);
    }
  };

  const handleStartEdit = (item: ListItem) => {
    setEditingItemId(item._id);
    setEditingName(item.name);
    setEditingQuantity(item.quantity.toString());
    setEditingWeight(item.weight !== null && item.weight !== undefined ? item.weight.toString() : '');
    setEditingWeightUnit(item.weightUnit || 'lbs');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingName('');
    setEditingQuantity('');
    setEditingWeight('');
    setEditingWeightUnit('');
  };

  const handleSaveEdit = async (itemId: string) => {
    if (!listId || !editingName.trim()) return;

    try {
      setError('');

      const body: any = {
        name: editingName.trim(),
        quantity: parseInt(editingQuantity) || 1,
      };

      // Add weight if provided (optional)
      const weightValue = editingWeight.trim();
      if (weightValue && !isNaN(parseFloat(weightValue)) && parseFloat(weightValue) > 0) {
        body.weight = parseFloat(weightValue);
        body.weightUnit = editingWeightUnit || 'lbs';
      } else {
        // Clear weight if field is empty
        body.weight = null;
        body.weightUnit = null;
      }

      const response = await fetch(`${API_URL}/api/lists/${listId}/items/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update item');
      }

      setEditingItemId(null);
      fetchList(); // Refresh list
    } catch (err: any) {
      console.error('Error updating item:', err);
      setError(err.message || 'Failed to update item. Please try again.');
    }
  };

  const handleTogglePurchased = async (item: ListItem) => {
    if (!listId) return;

    try {
      setError('');

      const response = await fetch(`${API_URL}/api/lists/${listId}/items/${item._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          purchased: !item.purchased,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update item');
      }

      fetchList(); // Refresh list
    } catch (err: any) {
      console.error('Error updating item:', err);
      setError(err.message || 'Failed to update item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!listId) return;
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      setError('');

      const response = await fetch(`${API_URL}/api/lists/${listId}/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete item');
      }

      fetchList(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting item:', err);
      setError(err.message || 'Failed to delete item. Please try again.');
    }
  };

  const handleDeleteList = async () => {
    if (!listId) return;
    if (!window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) return;

    try {
      setError('');

      const response = await fetch(`${API_URL}/api/lists/${listId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete list');
      }

      navigate('/lists');
    } catch (err: any) {
      console.error('Error deleting list:', err);
      setError(err.message || 'Failed to delete list. Please try again.');
    }
  };

  const handleLeaveList = async () => {
    if (!listId) return;
    if (!window.confirm('Are you sure you want to leave this list?')) return;

    try {
      setError('');

      const response = await fetch(`${API_URL}/api/lists/${listId}/leave`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to leave list');
      }

      navigate('/lists');
    } catch (err: any) {
      console.error('Error leaving list:', err);
      setError(err.message || 'Failed to leave list. Please try again.');
    }
  };

  const handleCopyCode = () => {
    if (list?.code) {
      navigator.clipboard.writeText(list.code);
      alert('List code copied to clipboard!');
    }
  };

  const handleUpdateListName = async () => {
    if (!listId || !listNameValue.trim()) {
      setEditingListName(false);
      setListNameValue(list?.name || '');
      return;
    }

    try {
      setError('');

      const response = await fetch(`${API_URL}/api/lists/${listId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: listNameValue.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update list name');
      }

      setEditingListName(false);
      fetchList(); // Refresh list
    } catch (err: any) {
      console.error('Error updating list name:', err);
      setError(err.message || 'Failed to update list name. Please try again.');
      setListNameValue(list?.name || '');
    }
  };

  const getFilteredItems = () => {
    if (!list) return [];
    let items = list.items;
    
    // Apply filter
    switch (filter) {
      case 'unpurchased':
        items = items.filter(item => !item.purchased);
        break;
      case 'purchased':
        items = items.filter(item => item.purchased);
        break;
      default:
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query)
      );
    }

    return items;
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return '';
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  };

  if (loading && !list) {
    return (
      <div className="app-page">
        <Header />
        <main className="dashboard-page">
          <div className="dashboard-shell">
            <div className="dashboard-card">
              <span className="section-eyebrow">Syncing</span>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
                Loading list…
              </h2>
              <p className="section-subtitle">We’re pulling the freshest version for you.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="app-page">
        <Header />
        <main className="dashboard-page">
          <div className="dashboard-shell">
            <div className="dashboard-card">
              <span className="section-eyebrow">Oops</span>
              <h2 className="section-title">List not found</h2>
              <p className="section-subtitle">{error || 'Either it was removed or you lost access.'}</p>
              <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/lists')}>
                Back to Lists
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="app-page">
      <Header />
      <main className="dashboard-page">
        <div className="dashboard-shell">
          <button className="back-link" onClick={() => navigate('/lists')}>
            ← Back to Lists
          </button>

          <section className="dashboard-card">
            {editingListName ? (
              <div className="inline-actions">
                <input
                  type="text"
                  className="inline-input"
                  value={listNameValue}
                  onChange={(e) => setListNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateListName();
                    } else if (e.key === 'Escape') {
                      setEditingListName(false);
                      setListNameValue(list.name);
                    }
                  }}
                  autoFocus
                />
                <button className="btn btn-primary" onClick={handleUpdateListName}>
                  Save
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditingListName(false);
                    setListNameValue(list.name);
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h2 className="section-title" style={{ margin: 0 }} onClick={() => setEditingListName(true)}>
                  {list.name} ✏️
                </h2>
                <span className="badge">Tap to rename</span>
              </div>
            )}
            {list.description && (
              <p className="section-subtitle" style={{ textAlign: 'left', marginTop: '0.75rem' }}>
                {list.description}
              </p>
            )}

            <div className="list-toolbar" style={{ marginTop: '1.25rem' }}>
              <div className="badge">
                List Code • <strong>{list.code}</strong>
              </div>
              <div className="danger-zone">
                <button className="btn btn-secondary" onClick={handleCopyCode}>
                  Copy Code
                </button>
                {list.isCreator ? (
                  <button className="btn btn-danger" onClick={handleDeleteList}>
                    Delete List
                  </button>
                ) : (
                  <button className="btn btn-danger" onClick={handleLeaveList}>
                    Leave List
                  </button>
                )}
              </div>
            </div>
          </section>

          {error && (
            <div className="alert-card" style={{ color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <section className="dashboard-card">
            <div className="list-toolbar">
              <div>
                <span className="section-eyebrow">Progress</span>
                <h3 style={{ margin: 0 }}>
                  {list.purchasedItems} / {list.totalItems} items purchased
                  {searchQuery && filteredItems.length !== list.items.length && (
                    <span style={{ color: 'var(--text-faint)', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                      ({filteredItems.length} matching)
                    </span>
                  )}
                </h3>
              </div>
              <div className="filters">
                {(['all', 'unpurchased', 'purchased'] as const).map((option) => (
                  <button
                    key={option}
                    className={`filter-chip ${filter === option ? 'active' : ''}`}
                    type="button"
                    onClick={() => setFilter(option)}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {lastUpdated && (
              <div className="timestamp" style={{ marginTop: '0.75rem' }}>
                Last refreshed {getTimeSinceUpdate()}
              </div>
            )}
          </section>

          <section className="dashboard-card">
            <span className="section-eyebrow">Add item</span>
            <form onSubmit={handleAddItem} className="item-form" style={{ marginTop: '1rem' }}>
              <div className="field">
                <label className="section-eyebrow" style={{ letterSpacing: '0.2em' }}>
                  Item
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Almond milk"
                  required
                  maxLength={200}
                  className="input-field"
                />
              </div>
              <div className="field-small">
                <label className="section-eyebrow">Qty</label>
                <input
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  min="1"
                  max="9999"
                  className="input-field"
                />
              </div>
              <div className="field-small">
                <label className="section-eyebrow">Weight</label>
                <input
                  id="newItemWeight"
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  placeholder="Optional"
                />
              </div>
              <div className="field-tiny">
                <label className="section-eyebrow">Unit</label>
                <select id="newItemWeightUnit" defaultValue="lbs" className="select-field">
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                  <option value="oz">oz</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addingItem || !newItemName.trim()}
              >
                {addingItem ? 'Adding…' : 'Add Item'}
              </button>
            </form>
          </section>

          <section className="dashboard-card">
            {filteredItems.length === 0 ? (
              <div className="empty-state">
                {searchQuery
                  ? `No items found matching “${searchQuery}”.`
                  : filter === 'all'
                  ? 'No items in this list yet. Add one above!'
                  : `No ${filter} items right now.`}
              </div>
            ) : (
              <ul className="item-list">
                {filteredItems.map((item) => (
                  <li
                    key={item._id}
                    className={`item-row ${item.purchased ? 'purchased' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={item.purchased}
                      onChange={() => handleTogglePurchased(item)}
                    />

                    {editingItemId === item._id ? (
                      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="input-field"
                          style={{ flex: 1, minWidth: '200px' }}
                        />
                        <input
                          type="number"
                          value={editingQuantity}
                          onChange={(e) => setEditingQuantity(e.target.value)}
                          min="1"
                          max="9999"
                          className="input-field"
                          style={{ maxWidth: '90px' }}
                        />
                        <input
                          type="number"
                          value={editingWeight}
                          onChange={(e) => setEditingWeight(e.target.value)}
                          step="0.01"
                          min="0"
                          className="input-field"
                          style={{ maxWidth: '120px' }}
                        />
                        <select
                          value={editingWeightUnit}
                          onChange={(e) => setEditingWeightUnit(e.target.value)}
                          className="select-field"
                          style={{ maxWidth: '90px' }}
                        >
                          <option value="lbs">lbs</option>
                          <option value="kg">kg</option>
                          <option value="oz">oz</option>
                          <option value="g">g</option>
                          <option value="lb">lb</option>
                        </select>
                        <div className="inline-actions">
                          <button className="btn btn-primary" type="button" onClick={() => handleSaveEdit(item._id)}>
                            Save
                          </button>
                          <button className="btn btn-ghost" type="button" onClick={handleCancelEdit}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="item-row-content"
                          onClick={() => handleStartEdit(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          <h4 style={{ textDecoration: item.purchased ? 'line-through' : 'none' }}>
                            {item.name}
                            <span style={{ color: 'var(--text-subtle)', marginLeft: '0.5rem' }}>
                              × {item.quantity}
                            </span>
                            {item.weight && item.weightUnit && (
                              <span style={{ color: 'var(--accent-strong)', marginLeft: '0.5rem', fontSize: '0.9rem' }}>
                                ({item.weight} {item.weightUnit})
                              </span>
                            )}
                          </h4>
                          <small>
                            Added by {item.addedByName}
                            {item.purchased && item.purchasedBy && (
                              <span>
                                {' '}
                                • Purchased by {item.purchasedBy.firstName} {item.purchasedBy.lastName}
                              </span>
                            )}
                          </small>
                        </div>
                        <button className="btn btn-danger" onClick={() => handleDeleteItem(item._id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

