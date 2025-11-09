import logo from "../assets/NewLogo.png";

function PageTitle() {
  return (
    <div id="page-title" style={{ textAlign: "center", marginBottom: "20px" }}>
      {/* SVG image */}
      <img src={logo} alt="SharedCart Logo" width="80" height="80" style={{ maxWidth: "100%", height: "auto" }} />

      {/* Title text */}
      <h1 id="title" style={{ margin: "10px 0", fontSize: "2em" }}>SharedCart</h1>
    </div>
  );
}

export default PageTitle;
