import DashboardLayout from "../../layouts/Secretary_layout";
import Buttons from "../../components/Buttons";
import Form from "../../components/Form";
import Secretary_layout from "../../layouts/Secretary_layout";
import { useNavigate } from "react-router-dom";



function Add_student_secretary() {

  const navigate = useNavigate();
  const handleSave = () => {
    console.log("Student added successfully");
    navigate("/Student_secretary");
  };

  return (
    <Secretary_layout>
      <section className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl text-[#701366]">Add Student</h1>
        <Buttons  cancelPath="/Student_secretary" 
          onSave={handleSave}
        />
      </section>
      <Form />
    </Secretary_layout>
  );
}

export default Add_student_secretary;