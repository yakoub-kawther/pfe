import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { SIDEBAR_W } from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fffafe", color: "#701366" }}>

      {/* Sidebar — fixed, always exactly SIDEBAR_W wide */}
      <Sidebar />

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
        <Navbar role="admin" />
        <main style={{ flex: 1, padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;