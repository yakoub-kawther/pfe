import DashboardLayout from "../components/DashboardLayout";
import Buttons from "../components/Buttons";
import Form from "../components/Form";

function AddStudent() {
  return (
    
    <DashboardLayout>
      <section className="flex items-center  justify-between mb-6">
       <h1 className="text-2xl  text-[#701366]">Add Student</h1>
        
        <Buttons />
      </section>
        <Form />

    </DashboardLayout>
  );
}

export default AddStudent;