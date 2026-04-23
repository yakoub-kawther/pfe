import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = ({ children }) => {
  return (
    <div
      className="flex min-h-screen bg-[#fffafe] text-[#701366]"
      style={{ minWidth: 0 }}
    >
      {/* Sidebar — fixed width, never shrinks */}
      <div style={{ width: "160px", minWidth: "160px", flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div
        className="flex flex-col flex-1"
        style={{ minWidth: 0, overflow: "hidden" }}
      >
        <Navbar />

        <main
          className="flex-1 flex flex-col gap-0"
          style={{ padding: "5px 20px" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;