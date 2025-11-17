import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/SharedCartLogo.png";
import "../HomePage.css";

function HomePage() {
  const [user, setUser] = useState<{ firstName: string } | null>(null);
  const navigate = useNavigate();

  //for displaying user's name after they log in
  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  //for logging out user
  function handleLogout(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    localStorage.removeItem("user_data");
    setUser(null);
    window.location.href = '/';
  }

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="home">
      {/* Header */}
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
      </header>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">
            Shop Together, Stay Organized
          </h1>
          <p className="hero-subtitle">
            Create shared shopping lists with your family and roommates. 
            Add items, edit in real-time, and never forget what you need.
          </p>
          {!user && (
            <div className="hero-buttons">
              <Link to="/signup" className="cta-button primary">
                Get Started Free
              </Link>
              <Link to="/login" className="cta-button secondary">
                Sign In
              </Link>
            </div>
          )}
          {user && (
            <div className="hero-buttons">
              <Link to="/lists" className="cta-button primary">
                View My Lists
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why SharedCart?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Create & Share Lists</h3>
            <p>Create shopping lists and share them with your family or roommates instantly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✏️</div>
            <h3>Real-Time Updates</h3>
            <p>See changes as they happen. Add, edit, or remove items in real-time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Mark as Purchased</h3>
            <p>Check off items as you buy them. Everyone can see what's been purchased.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Multiple Lists</h3>
            <p>Create different lists for groceries, household items, or anything you need.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up for free and start creating your first shopping list.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Create or Join a List</h3>
            <p>Create a new list or join an existing one using a share code.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Start Shopping</h3>
            <p>Add items, mark them as purchased, and keep everyone in sync.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 SharedCart. All rights reserved.</p>
        <div className="footer-links">
          <a 
            href="https://github.com/Leyley0323/MERN-Project" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ marginRight: '8px', verticalAlign: 'middle' }}
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;



/*NOTES*/
/*automattically sort by location in the List */
