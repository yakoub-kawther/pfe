import React from "react";
import Teacher_sidebar from "../components/Sidebar/Teacher_sidebar";
import { SIDEBAR_W } from "../components/Sidebar/Teacher_sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fffafe", color: "#701366" }}>

      {/* Sidebar — fixed, always exactly SIDEBAR_W wide */}
      <Teacher_sidebar />

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
        <Navbar role="teacher" />
        <main style={{ flex: 1, padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;