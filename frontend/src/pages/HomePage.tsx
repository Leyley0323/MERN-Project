import { useState, useEffect } from "react";
import "../HomePage.css";
import { Link } from "react-router-dom";


interface SearchResult {
  name: string;
  price: number;
  image: string;
  retailer: string;
  url: string;
}

interface MockSearchResults {
  [key: string]: SearchResult;
}

function HomePage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentWord, setCurrentWord] = useState<number>(0);
  

  const cyclingWords = ["fast", "reliable", "simple", "easy", "cheap"];

  // Cycle through words
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % cyclingWords.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Mock data - backend will replace this with real API calls
  const mockSearchResults: MockSearchResults = {
    tomato: {
      name: "Organic Tomatoes (1 lb)",
      price: 2.99,
      image: "/tomato.jpg",
      retailer: "Walmart",
      url: "https://www.walmart.com",
    },
    laptop: {
      name: 'HP 15.6" Laptop',
      price: 449.99,
      image: "/laptop.jpg",
      retailer: "Best Buy",
      url: "https://www.bestbuy.com",
    },
    headphones: {
      name: "Sony Noise Cancelling Headphones",
      price: 178.0,
      image: "/headphones.jpg",
      retailer: "Amazon",
      url: "https://www.amazon.com",
    },
  };

  const handleSearch = async (): Promise<void> => {
    if (!searchTerm.trim()) return;

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const result = mockSearchResults[searchTerm.toLowerCase()] || {
        name: `${searchTerm}`,
        price: 19.99,
        image: "/placeholder.jpg",
        retailer: "Generic Store",
        url: "https://www.example.com",
      };

      setSearchResult(result);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <img src="/logo.png" alt="logo" className="logo" />
          <div className="search-container">
            <input
              className="search-bar"
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search-button" onClick={handleSearch}>
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
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
          <nav className="nav">
            <Link to="/shoppinglist" className="nav-link">
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
              Shopping List
            </Link>
            <a href="#" className="nav-link">
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
              Sign Up
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="hero-banner">
        <h1>
          Shop{" "}
          <span className="cycling-word" key={currentWord}>
            {cyclingWords[currentWord]}
          </span>{" "}
          with CheapCart!
        </h1>
      </section>

      {/* Search Results Section */}
      {loading && (
        <section className="search-results">
          <p className="loading">Searching for the best deals...</p>
        </section>
      )}

      {searchResult && !loading && (
        <section className="search-results">
          <h2>Cheapest "{searchTerm}" Found:</h2>
          <div className="result-card">
            <img src={searchResult.image} alt={searchResult.name} />
            <div className="result-info">
              <h3>{searchResult.name}</h3>
              <p className="result-price">${searchResult.price.toFixed(2)}</p>
              <p className="result-retailer">
                Available at: {searchResult.retailer}
              </p>
              <div className="result-buttons">
                <a
                  href={searchResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="view-product-btn">
                    View on {searchResult.retailer}
                  </button>
                </a>
                <button className="add-to-list-btn">Add to List</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="products-section">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {[
            { name: "HP Laptop", price: "$799.99", img: "/laptop.jpg" },
            {
              name: "Noise Cancelling Headphones",
              price: "$199.99",
              img: "/headphones.jpg",
            },
            { name: "Smartphone", price: "$699.99", img: "/laptop.jpg" },
            { name: "Smartwatch", price: "$249.99", img: "/watch.jpg" },
          ].map((product, idx) => (
            <div className="product-card" key={idx}>
              <img src={product.img} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{product.price}</p>
              <button>Add to List</button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 CheapCart. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;



/*NOTES*/
/*automattically sort by location in the List */
