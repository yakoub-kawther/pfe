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
import  Languages  from "./pages/admin/Languages";
import Add_language from "./pages/admin/Add_language";
import Inscriptions from "./pages/admin/Inscriptions"
import Add_student_payment from "./pages/admin/Add_student_payment";
import Add_employees_fees from "./pages/admin/Add_employees_fees";
import Edit_classes from "./pages/admin/Edit_classes";
import Add_position from "./pages/admin/Add_position";
import Edit_position from "./pages/admin/Edit_position";

import Dashboard_secretary from "./pages/secretary/Dashboard_secretary";
import Secretary_sidebar from "./components/Sidebar/Secretary_sidebar";
import Student_secretary from "./pages/secretary/Student_secretary";
import Classes_secretary from "./pages/secretary/Classes_secretary";
import Fees_secretary from "./pages/secretary/Fees_secretary";
import Timetable_secretary from "./pages/secretary/Timetable_secretary";
import Notifications_secretary from "./pages/secretary/Notifications_secretary";
import Inscriptions_secretary from "./pages/secretary/Inscriptions_secretary";
import Settings_secretary from "./pages/secretary/Settings_secretary";
import Secretary_layout from "./layouts/Secretary_layout";
import Add_student_secretary from "./pages/secretary/Add_student_secretary";
import Edit_student_secretary from "./pages/secretary/Edit_student_secretary";
import Student_profile_secretary from "./pages/secretary/Student_profile_secretary";
import Student_classes_secretary from "./pages/secretary/Student_classes_secretary";
import Payment_student_secretary from "./pages/secretary/Payment_student_secretary";
import Attendance_student_secretary from "./pages/secretary/Attendance_student_secretary";
import Add_classes_secretary from "./pages/secretary/Add_classes_secretary";
import Classes_information_secretary from "./pages/secretary/Classes_information_secretary";
import Edit_classes_secretary from "./pages/secretary/Edit_classes_secretary";
import Classrooms_secretary from "./pages/secretary/Classrooms_secretary"; 
import Add_classrooms_secretary from "./pages/secretary/Add_classrooms_secretary";
import Languages_secretary from "./pages/secretary/Languages_secretary";
import Add_language_secretary from "./pages/secretary/Add_language_secretary"
import Add_employees_fees_secretary from "./pages/secretary/Add_employees_fees_secretary";
import Add_student_fees_secretary from "./pages/secretary/Add_student_fees_secretary";

import Dashboard_teacher from "./pages/teacher/Dashboard_teacher";
import Classes_teacher from "./pages/teacher/Classes_teacher";
import Session_attendance_teacher from "./pages/teacher/Session_attendance_teacher";
import Class_sessions_teacher from "./pages/teacher/Class_sessions_teacher";
import Teacher_layout from "./layouts/Teacher_layout";
import Notifications_teacher from "./pages/teacher/Notifications_teacher";
import Settings_teacher from "./pages/teacher/Settings_teacher";
import Profile_teacher from "./pages/teacher/Profile_teacher";
import Timetable_teacher from "./pages/teacher/Timetable_teacher";
import Notes_teacher from "./pages/teacher/Notes_teacher";
import Notes_student_teacher from "./pages/teacher/Notes_student_teacher";
import Add_notes_teacher from "./pages/teacher/Add_notes_teacher";
import Fees_teacher from "./pages/teacher/Fees_teacher";


import Student_layout from "./layouts/Student_layout";
import Dashboard_student from "./pages/student/Dashboard_student";
import Profile_student from "./pages/student/Profile_student";
import Notes_student from "./pages/student/Notes_student";
import Notes_student_student from "./pages/student/Notes_student_student";
import Time_table_student from "./pages/student/Timetable_student";
import Classes_student from "./pages/student/Classes_student";
import Attendance_detail_student from "./pages/student/Attendance_detail_student";
import Fees_student from "./pages/student/Fees_student";
import Fees_detail_student from "./pages/student/Fees_detail_student";
import Settings_student from "./pages/student/Settings_student";
import Notifications_student from "./pages/student/Notifications_student";

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
        <Route path="/Add_Classrooms" element={<Add_classrooms />} />
        <Route path="/Settings" element={<Settings/>}/>
        <Route path="/Fees" element={<Fees/>} />
        <Route path="/Dashboard_secretary" element={<Dashboard_secretary/>} />
        <Route path="/Languages" element={<Languages/>} />
        <Route path="/Add_language" element={<Add_language/>} />
        <Route path="/Inscriptions" element={<Inscriptions/>} />
        <Route path="/Add_student_payment" element={<Add_student_payment/>} />
        <Route path="/Add_employees_fees" element={<Add_employees_fees/>} />
         <Route path="/Edit_classes" element={<Edit_classes />} />
          <Route path="/Add_position" element={<Add_position />} />
          <Route path="/Edit_position" element={<Edit_position />} />


 {/* Secretary Routes */}
        <Route path="/secretary" element={<Secretary_layout />}/>
          <Route path="/Dashboard_secretary" element={<Dashboard_secretary />} />
          <Route path="/Student_secretary" element={<Student_secretary />} />
          <Route path="/Classes_secretary" element={<Classes_secretary />} />
          <Route path="/Fees_secretary" element={<Fees_secretary />} />
          <Route path="/Add_student_secretary" element={<Add_student_secretary />} />
          <Route path="/Edit_student_secretary" element={<Edit_student_secretary />} />
          <Route path="/Student_profile_secretary" element={<Student_profile_secretary />} />
          <Route path="/Student_classes_secretary" element={<Student_classes_secretary />} />
          <Route path="/Payment_student_secretary" element={<Payment_student_secretary />} />
          <Route path="/Attendance_student_secretary" element={<Attendance_student_secretary />} />
          <Route path="/Add_classes_secretary" element={<Add_classes_secretary />} />
          <Route path="/Classes_information_secretary" element={<Classes_information_secretary />} />
          <Route path="/Edit_classes_secretary" element={<Edit_classes_secretary />} />
          <Route path="/Classrooms_secretary" element={<Classrooms_secretary />} />
          <Route path="/Add_classrooms_secretary" element={<Add_classrooms_secretary />} />
          <Route path="/Languages_secretary" element={<Languages_secretary/>}/>
          <Route path="/Add_language_secretary" element={<Add_language_secretary/>}/>
          <Route path="/Add_employees_fees_secretary" element={<Add_employees_fees_secretary/>}/>
          <Route path="/Add_student_fees_secretary" element={<Add_student_fees_secretary/>}/>
          <Route path="/Timetable_secretary" element={<Timetable_secretary/>}/>
          <Route path="/Notifications_secretary" element={<Notifications_secretary />} />
          <Route path="/Inscriptions_secretary" element={<Inscriptions_secretary />} />
          <Route path="/Settings_secretary" element={<Settings_secretary />} />

 {/* Teacher Routes */}
        <Route path="/teacher" element={<Teacher_layout />}/>
          <Route path="/Dashboard_teacher" element={<Dashboard_teacher />} />
          <Route path="/Classes_teacher" element={<Classes_teacher />} />
          <Route path="/Class_sessions_teacher" element={<Class_sessions_teacher />} />
          <Route path="/Session_attendance_teacher" element={<Session_attendance_teacher />} />
          <Route path="/Notifications_teacher" element={<Notifications_teacher />} />
          <Route path="/Settings_teacher" element={<Settings_teacher />} />
          <Route path="/Profile_teacher" element={<Profile_teacher />} />
          <Route path="/Timetable_teacher" element={<Timetable_teacher />} />
          <Route path="/Notes_teacher" element={<Notes_teacher />} />
          <Route path="/Notes_students_teacher" element={<Notes_student_teacher />} />
          <Route path="/Notes_add_teacher" element={<Add_notes_teacher />} />
          <Route path="/Fees_teacher" element={<Fees_teacher />} />



   {/* Student Routes */}
        <Route path="/student" element={<Student_layout />}/>
        <Route path="/Dashboard_student" element={<Dashboard_student />} />
        <Route path="/Profile_student" element={<Profile_student />} />
        <Route path="/Notes_student" element={<Notes_student />} />
        <Route path="/Notes_students_student" element={<Notes_student_student />} />
        <Route path="/Timetable_student" element={<Time_table_student />} />
        <Route path="/Classes_student" element={<Classes_student />} />
        <Route path="/Attendance_detail_student" element={<Attendance_detail_student />} />
        <Route path="/Fees_student" element={<Fees_student />} />
        <Route path="/Fees_detail_student" element={<Fees_detail_student />} />
        <Route path="/Settings_student" element={<Settings_student />} />
        <Route path="/Notifications_student" element={<Notifications_student />} />


      </Routes>
 
  );
}

export default App;