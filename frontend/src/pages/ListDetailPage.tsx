import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../config/api';
import { getAuthHeaders, isLoggedIn } from '../utils/auth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../AuthPage.css';

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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="auth-page" style={{ flex: 1 }}>
          <div className="auth-container">
            <div style={{ textAlign: 'center', color: '#fff', padding: '20px' }}>
              Loading list...
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!list) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div className="auth-page" style={{ flex: 1 }}>
          <div className="auth-container">
            <div style={{ textAlign: 'center', color: '#ff4444', padding: '20px' }}>
              {error || 'List not found'}
            </div>
            <button
              onClick={() => navigate('/lists')}
              style={{
                backgroundColor: '#f7df05ff',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                margin: '20px auto',
                display: 'block',
              }}
            >
              Back to Lists
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div className="auth-page" style={{ flex: 1 }}>
        <div className="auth-container" style={{ maxWidth: '800px' }}>
        
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
              marginBottom: '20px',
            }}
          >
            ← Back to Lists
          </button>
        </div>

        {/* Editable List Name */}
        <div style={{ marginBottom: '20px' }}>
          {editingListName ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
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
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #f7df05',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  fontSize: '20px',
                  fontWeight: '600',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />
              <button
                onClick={handleUpdateListName}
                style={{
                  backgroundColor: '#03b320ff',
                  color: '#000',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingListName(false);
                  setListNameValue(list.name);
                }}
                style={{
                  backgroundColor: '#666',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 
                style={{ 
                  color: '#f7df05ff', 
                  marginBottom: '10px',
                  cursor: 'pointer',
                  display: 'inline-block',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => setEditingListName(true)}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(247, 223, 5, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Click to edit list name"
              >
                {list.name} ✏️
              </h2>
            </div>
          )}
          {list.description && (
            <p style={{ color: '#aaa', marginBottom: '20px', marginTop: '0' }}>{list.description}</p>
          )}
        </div>

        <div style={{ 
          backgroundColor: '#1a1a1a', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ color: '#fff', marginBottom: '5px' }}>
                <strong>Code:</strong> <span style={{ color: '#f7df05ff', fontFamily: 'monospace' }}>{list.code}</span>
              </div>
              <div style={{ color: '#aaa', fontSize: '14px' }}>
                Created by: {list.creatorName}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleCopyCode}
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Copy Code
              </button>
              {list.isCreator ? (
                <button
                  onClick={handleDeleteList}
                  style={{
                    backgroundColor: '#ff4444',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Delete List
                </button>
              ) : (
                <button
                  onClick={handleLeaveList}
                  style={{
                    backgroundColor: '#ff8800',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Leave List
                </button>
              )}
            </div>
          </div>
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

        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search items..."
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

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ color: '#03b320ff', fontSize: '18px', fontWeight: '600' }}>
            {list.purchasedItems} of {list.totalItems} items purchased
            {searchQuery && filteredItems.length !== list.items.length && (
              <span style={{ color: '#aaa', fontSize: '14px', marginLeft: '10px' }}>
                ({filteredItems.length} matching)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                backgroundColor: filter === 'all' ? '#03b320ff' : '#333',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unpurchased')}
              style={{
                backgroundColor: filter === 'unpurchased' ? '#03b320ff' : '#333',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Unpurchased
            </button>
            <button
              onClick={() => setFilter('purchased')}
              style={{
                backgroundColor: filter === 'purchased' ? '#03b320ff' : '#333',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Purchased
            </button>
          </div>
        </div>

        {lastUpdated && (
          <div style={{ 
            color: '#888', 
            fontSize: '12px', 
            textAlign: 'right', 
            marginBottom: '10px',
            fontStyle: 'italic'
          }}>
            Last updated: {getTimeSinceUpdate()}
          </div>
        )}

        <form onSubmit={handleAddItem} style={{ marginBottom: '30px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'flex-end',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '5px', fontSize: '14px' }}>
                Item Name
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name"
                required
                maxLength={200}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #333',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ width: '100px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '5px', fontSize: '14px' }}>
                Qty
              </label>
              <input
                type="number"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                min="1"
                max="9999"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #333',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '5px', fontSize: '14px' }}>
                Weight (Optional)
              </label>
              <input
                id="newItemWeight"
                type="number"
                step="0.01"
                min="0"
                placeholder="Optional"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #333',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ width: '80px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '5px', fontSize: '14px' }}>
                Unit
              </label>
              <select
                id="newItemWeightUnit"
                defaultValue="lbs"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #333',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
                <option value="oz">oz</option>
                <option value="g">g</option>
                <option value="lb">lb</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={addingItem || !newItemName.trim()}
              style={{
                backgroundColor: '#03b320ff',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: addingItem || !newItemName.trim() ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                opacity: addingItem || !newItemName.trim() ? 0.5 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {addingItem ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>

        {filteredItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#aaa', 
            padding: '40px 20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '2px solid #333'
          }}>
            {searchQuery 
              ? `No items found matching "${searchQuery}"`
              : filter === 'all' 
                ? 'No items in this list yet. Add one above!'
                : `No ${filter} items.`
            }
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filteredItems.map((item, index) => (
              <li
                key={item._id}
                style={{
                  backgroundColor: index % 2 === 0 ? '#1a1a1a' : '#252525',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  padding: '15px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  opacity: item.purchased ? 0.7 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={item.purchased}
                  onChange={() => handleTogglePurchased(item)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                  }}
                />
                
                {editingItemId === item._id ? (
                  <div style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      style={{
                        flex: 1,
                        minWidth: '200px',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '2px solid #03b320ff',
                        backgroundColor: '#000',
                        color: '#fff',
                        fontSize: '16px',
                      }}
                      autoFocus
                    />
                    <input
                      type="number"
                      value={editingQuantity}
                      onChange={(e) => setEditingQuantity(e.target.value)}
                      min="1"
                      max="9999"
                      style={{
                        width: '80px',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '2px solid #03b320ff',
                        backgroundColor: '#000',
                        color: '#fff',
                        fontSize: '16px',
                      }}
                    />
                    <input
                      type="number"
                      value={editingWeight}
                      onChange={(e) => setEditingWeight(e.target.value)}
                      step="0.01"
                      min="0"
                      placeholder="Weight (optional)"
                      style={{
                        width: '120px',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '2px solid #03b320ff',
                        backgroundColor: '#000',
                        color: '#fff',
                        fontSize: '16px',
                      }}
                    />
                    <select
                      value={editingWeightUnit}
                      onChange={(e) => setEditingWeightUnit(e.target.value)}
                      style={{
                        width: '70px',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '2px solid #03b320ff',
                        backgroundColor: '#000',
                        color: '#fff',
                        fontSize: '16px',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="lbs">lbs</option>
                      <option value="kg">kg</option>
                      <option value="oz">oz</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                    </select>
                    <button
                      onClick={() => handleSaveEdit(item._id)}
                      style={{
                        backgroundColor: '#03b320ff',
                        color: '#000',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        backgroundColor: '#666',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleStartEdit(item)}>
                      <div style={{ 
                        color: item.purchased ? '#888' : '#fff', 
                        textDecoration: item.purchased ? 'line-through' : 'none',
                        fontSize: '16px',
                        marginBottom: '5px',
                      }}>
                        <strong>{item.name}</strong>
                        <span style={{ color: '#aaa', marginLeft: '10px' }}>× {item.quantity}</span>
                        {item.weight && item.weightUnit && (
                          <span style={{ color: '#f7df05', marginLeft: '10px', fontSize: '14px' }}>
                            ({item.weight} {item.weightUnit})
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#888', fontSize: '12px' }}>
                        Added by {item.addedByName}
                        {item.purchased && item.purchasedBy && (
                          <span> • Purchased by {item.purchasedBy.firstName} {item.purchasedBy.lastName}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#ff4444',
                        border: '1px solid #ff4444',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#ff4444';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#ff4444';
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

