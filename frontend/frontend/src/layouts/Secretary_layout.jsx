import React from "react";
import Secretary_sidebar from "../components/Sidebar/Secretary_sidebar";
import { SIDEBAR_W } from "../components/Sidebar/Secretary_sidebar";
import Navbar from "../components/Navbar";

const Secretary_layout = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fffafe", color: "#701366" }}>

      {/* Sidebar — fixed, always exactly SIDEBAR_W wide */}
      <Secretary_sidebar />

      {/* Main area — pushed right by exactly SIDEBAR_W so it never overlaps */}
      <div
        style={{
          marginLeft: SIDEBAR_W,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Navbar role="secretary" />
        <main style={{ flex: 1, padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Secretary_layout;