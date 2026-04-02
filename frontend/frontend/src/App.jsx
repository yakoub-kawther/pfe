import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Student_list";
import Teachers from "./pages/Teachers";

function App() {
  return (
    <BrowserRouter>

      <Sidebar />

      <div className="ml-44 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
        </Routes>
      </div>

    </BrowserRouter>
  );
}

export default App;