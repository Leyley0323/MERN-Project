import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../HomePage.css';
import SharedCartLogo from '../assets/SharedCartLogo.png';

function Header() {
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    localStorage.removeItem('user_data');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-container" style={{ cursor: 'pointer' }} onClick={handleLogoClick}>
          <img 
            src={SharedCartLogo} 
            alt="SharedCart Logo" 
            style={{ 
              width: "56px", 
              height: "56px", 
              objectFit: "fill",
              display: "block"
            }}
          />
          <h1 className="logo-text" style={{ margin: 0 }}>SharedCart</h1>
        </div>
        <nav className="nav">
          {user ? (
            <>
              <span className="nav-link hi-user">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Hello, {user.firstName}!
              </span>
              <Link to="/lists" className="nav-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                My Lists
              </Link>
              <button className="nav-link logout-btn" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Sign In
              </Link>
              <Link to="/signup" className="nav-link signup-btn">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

