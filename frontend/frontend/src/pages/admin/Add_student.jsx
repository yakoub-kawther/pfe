import DashboardLayout from "../../layouts/DashboardLayout";
import Buttons from "../../components/Buttons";
import Form from "../../components/Form";
import { useNavigate } from "react-router-dom";



function AddStudent() {
  
  const navigate = useNavigate();
  const handleSave = () => {
    console.log("Student added successfully");
    navigate("/Students");
  };

  return (
    <DashboardLayout>
      <section className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl text-[#701366]">Add Student</h1>
        <Buttons 
          cancelPath="/Students"
          onSave={handleSave}
        />
      </section>
      <Form />
    </DashboardLayout>
  );
}

export default AddStudent;