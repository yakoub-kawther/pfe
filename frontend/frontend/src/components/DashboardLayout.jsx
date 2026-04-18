import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";


const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#fffafe] text-[#701366]">
      
      {/* Sidebar */}
      <div className="w-45">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="px-6 py-6 flex-1 flex flex-col gap-6">
        
        {/* Navbar */}
        <Navbar /> 

        {/* Page content */}
       <main className="px-6 py-6 flex-1 flex flex-col gap-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;