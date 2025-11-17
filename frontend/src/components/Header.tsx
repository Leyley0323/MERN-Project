import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/SharedCartLogo.png';
import '../HomePage.css';

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
            src={logo} 
            alt="SharedCart Logo" 
            width="50" 
            height="50" 
            style={{ 
              marginRight: '12px',
              transition: 'transform 0.2s ease, opacity 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '1';
            }}
          />
          <h1 className="logo-text" style={{ margin: 0 }}>SharedCart</h1>
        </div>
        <nav className="nav">
          {user ? (
            <>
              <span className="nav-link hi-user">
                Hello, {user.firstName}!
              </span>
              <Link to="/lists" className="nav-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
                  width="24"
                  height="24"
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
      <div style={{ width: '100%', height: '2px', backgroundColor: '#03b320' }}></div>
    </header>
  );
}

export default Header;

