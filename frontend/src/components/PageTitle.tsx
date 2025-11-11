import logo from "../assets/SharedCartLogo.png";

function PageTitle() {
  return (
    <div id="page-title" style={{ textAlign: "center", marginBottom: "20px" }}>
      {/* Logo image */}
      <img 
        src={logo} 
        alt="SharedCart Logo" 
        width="100" 
        height="100" 
        style={{ 
          maxWidth: "100%", 
          height: "auto",
          display: "block",
          margin: "0 auto"
        }} 
      />

      {/* Title text */}
      <h1 id="title" style={{ margin: "10px 0", fontSize: "2em" }}>SharedCart</h1>
    </div>
  );
}

export default PageTitle;
