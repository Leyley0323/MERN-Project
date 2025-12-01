import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { API_URL } from "../config/api";
import "../HomePage.css";
import SharedCartLogo from "../assets/SharedCartLogo.png";

interface Stats {
  users: number;
  lists: number;
  items: number;
}

function HomePage() {
  const [user, setUser] = useState<{ firstName: string } | null>(null);
  const [stats, setStats] = useState<Stats>({ users: 0, lists: 0, items: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  //for displaying user's name after they log in
  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch(`${API_URL}/api/stats`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default values (0) on error
      } finally {
        setStatsLoading(false);
      }
    };

    // Fetch immediately on mount
    fetchStats();

    // Auto-refresh every 5 minutes 
    const intervalId = setInterval(fetchStats, 15 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Format numbers nicely 
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toLocaleString();
  };

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
          <div className="hero-stats">
            <div className="stat-card">
              <span>Lists created</span>
              <strong>
                {statsLoading ? '...' : `${formatNumber(stats.lists)}+`}
              </strong>
            </div>
            <div className="stat-card">
              <span>Items added</span>
              <strong>
                {statsLoading ? '...' : formatNumber(stats.items)}
              </strong>
            </div>
            <div className="stat-card">
              <span>Users joined</span>
              <strong>
                {statsLoading ? '...' : formatNumber(stats.users)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why SharedCart?</h2>
        <p className="section-subtitle">
          A calm, modern workspace for households to stay in sync without juggling texts or sticky notes.
        </p>
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
        <p className="section-subtitle">
          Three simple steps to keep every grocery run coordinated and stress-free.
        </p>
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

      <section className="cta-panel">
        <h3>Ready to leave scattered notes behind?</h3>
        <p>
          Spin up your first list in seconds, invite the people you shop with, and watch everyone stay in sync.
          SharedCart keeps conversations focused and shopping effortless.
        </p>
        <div className="hero-buttons" style={{ marginTop: '1.5rem' }}>
          <Link to={user ? "/lists" : "/signup"} className="cta-button primary">
            {user ? "Open My Lists" : "Create a Free Account"}
          </Link>
          {!user && (
            <Link to="/login" className="cta-button secondary">
              I already have an account
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;



/*NOTES*/
/*automattically sort by location in the List */
