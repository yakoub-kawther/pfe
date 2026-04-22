import { Routes, Route , Navigate} from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import Teachers from "./pages/admin/Teachers";
import AddStudent from "./pages/admin/Add_student";
import StudentProfile from "./pages/admin/Student_profile";
import Student_classes from "./pages/admin/Student_classes";
import Payment from "./pages/admin/Payment_student";
import Attendance_student from "./pages/admin/Attendance_student";
import Time_table from "./pages/admin/Time_table";
import Notifications from "./pages/admin/Notifications";
import Employees from "./pages/admin/Employees";
import Classes from "./pages/admin/Classes";
import Classrooms from "./pages/admin/Classrooms";
import Edit_student from "./pages/admin/Edit_student";
import Classe_information from "./pages/admin/Classe_information";
import Addteacher from "./pages/admin/Add_teacher";
import Teacher_profile from "./pages/admin/Teacher_profile";
import Edit_teacher from "./pages/admin/Edit_teacher";
import Teacher_classes from "./pages/admin/Teacher_classes";
import Teacher_payment from "./pages/admin/Teacher_payment";
import Edit_employee from "./pages/admin/Edit_employee";
import Employee_profile from "./pages/admin/Employee_profile";
import Add_employee from "./pages/admin/Add_employee";
import Classes_information from "./pages/admin/Classes_information";
import Add_classe from "./pages/admin/Add_classe";
import Add_classrooms from "./pages/admin/Add_classrooms";
import Settings  from "./pages/admin/Settings";
import Fees from "./pages/admin/Fees";
import Dashboard_secretary from "./pages/secretary/Dashboard_secretary";

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
        <Route path="/Add_teacher" element={<Addteacher />} />
        <Route path="/Teacher_profile" element={<Teacher_profile />} />
        <Route path="/Edit_teacher" element={<Edit_teacher />} />
        <Route path="/Teacher_classes" element={<Teacher_classes />} />
        <Route path="/Teacher_payment" element={<Teacher_payment />} />
        <Route path="/Edit_employee" element={<Edit_employee />} />
        <Route path="/Employee_profile" element={<Employee_profile />} />
        <Route path="/Add_employee" element={<Add_employee />} />
        <Route path="/Classes_information" element={<Classes_information />} />
        <Route path="/Add_classe" element={<Add_classe />} />
        <Route path="/Add-Classrooms" element={<Add_classrooms />} />
        <Route path="/Settings" element={<Settings/>}/>
        <Route path="/Fees" element={<Fees/>} />
        <Route path="/Dashboard_secretary" element={<Dashboard_secretary/>} />



      </Routes>

  );
}

export default App;