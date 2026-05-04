import React from "react";
import Student_sidebar from "../components/Sidebar/Student_sidebar";
import { SIDEBAR_W } from "../components/Sidebar/Student_sidebar";
import Navbar from "../components/Navbar";

const Student_layout = ({ children }) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fffafe", color: "#701366" }}>

      {/* Sidebar — fixed, always exactly SIDEBAR_W wide */}
      <Student_sidebar />

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
        <Navbar role="student" />
        <main style={{ flex: 1, padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Student_layout;