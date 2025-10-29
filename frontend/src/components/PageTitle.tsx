import React from "react";
import logo from "../assets/logo.png";

function PageTitle() {
  return (
    <div id="page-title" style={{ textAlign: "center" }}>
      {/* SVG image */}
      <img src={logo} alt="Cheap Cart Logo" width="100" height="100" />

      {/* Title text */}
      <h1 id="title">Shop Smart with Cheap Cart!</h1>
    </div>
  );
}

export default PageTitle;
