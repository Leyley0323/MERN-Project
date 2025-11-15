import { useNavigate } from "react-router-dom";
import logo from "../assets/SharedCartLogo.png";

function PageTitle() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div id="page-title" style={{ textAlign: "center", marginBottom: "20px" }}>
      {/* Logo image - clickable */}
      <img 
        src={logo} 
        alt="SharedCart Logo" 
        width="100" 
        height="100" 
        onClick={handleLogoClick}
        style={{ 
          maxWidth: "100%", 
          height: "auto",
          display: "block",
          margin: "0 auto",
          cursor: "pointer",
          transition: "transform 0.2s ease, opacity 0.2s ease"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.opacity = "0.9";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.opacity = "1";
        }}
      />

      {/* Title text */}
      <h1 id="title" style={{ margin: "10px 0", fontSize: "2em" }}>SharedCart</h1>
    </div>
  );
}

export default PageTitle;
