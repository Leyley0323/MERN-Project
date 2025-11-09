import logo from "../assets/NewLogo.png";

function PageTitle() {
  return (
    <div id="page-title" style={{ textAlign: "center" }}>
      {/* SVG image */}
      <img src={logo} alt="SharedCart Logo" width="100" height="100" />

      {/* Title text */}
      <h1 id="title">SharedCart</h1>
    </div>
  );
}

export default PageTitle;
