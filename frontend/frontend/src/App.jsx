import { Routes, Route , Navigate} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import AddStudent from "./pages/Add_student";
import StudentProfile from "./pages/Student_profile";
import Student_classes from "./pages/Student_classes";
import Payment from "./pages/Payment_student";
import Attendance_student from "./pages/Attendance_student";
import Time_table from "./pages/Time_table";
import Notifications from "./pages/Notifications";
import Employees from "./pages/Employees";
import Classes from "./pages/Classes";
import Classrooms from "./pages/Classrooms";
import Edit_student from "./pages/Edit_student";
import Classe_information from "./pages/Classe_information";



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
        <Route path="/Student_classes" element={<Student_classes />} />
        <Route path="/Attendance_student" element={<Attendance_student />} />
        <Route path="/Time_table" element={<Time_table />} />
        <Route path="/Notifications" element={<Notifications />} />  
        <Route path="/Employees" element={<Employees />} />
        <Route path="/Classes" element={<Classes />} />
        <Route path="/Edit_student" element={<Edit_student />} />
        <Route path="/Classe_information" element={<Classe_information />} />
        <Route path="/Classrooms" element={<Classrooms />} />
      </Routes>

  );
}

export default App;