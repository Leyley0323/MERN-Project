import { useNavigate } from "react-router-dom";
import SharedCartLogo from "../assets/SharedCartLogo.png";

function PageTitle() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div id="page-title" style={{ textAlign: "center", marginBottom: "20px" }}>
      {/* Logo image - clickable */}
      <div 
        onClick={handleLogoClick}
        style={{ 
          display: "inline-block",
          cursor: "pointer",
          marginBottom: "10px"
        }}
      >
        <img 
          src={SharedCartLogo} 
          alt="SharedCart Logo" 
          style={{ 
            width: "250px", 
            height: "250px", 
            objectFit: "fill",
            display: "block",
            margin: "0 auto"
          }}
        />
      </div>

      {/* Title text */}
      <h1 id="title" style={{ margin: "10px 0", fontSize: "2em" }}>SharedCart</h1>
    </div>
  );
}

export default PageTitle;
