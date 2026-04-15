import { Routes, Route , Navigate} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import AddStudent from "./pages/Add_student";
import StudentProfile from "./pages/Student_profile";
import Classes from "./pages/Classes_student";
import Payment from "./pages/Payment_student";
import Attendance_student from "./pages/Attendance_student";
import Time_table from "./pages/Time_table";
import Notifications from "./pages/Notifications";
import Employees from "./pages/Employees";


const isLoggedIn = localStorage.getItem("user");

function App() {
  return (

     
     <Routes>
           <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/Dashboard" />
            ) : (
              <Navigate to="/Login" />
            )
          }
        />
        <Route path="/Login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Students" element={<Students />} />
        <Route path="/Teachers" element={<Teachers />} />
        <Route path="/Add_student" element={<AddStudent />} />
        <Route path="/Student_profile" element={<StudentProfile />} />
        <Route path="/Payment_student" element={<Payment />} />
        <Route path="/Classes_student" element={<Classes />} />
        <Route path="/Attendance_student" element={<Attendance_student />} />
        <Route path="/Time_table" element={<Time_table />} />
        <Route path="/Notifications" element={<Notifications />} />  
        <Route path="/Employees" element={<Employees />} />

      </Routes>

  );
}

export default App;