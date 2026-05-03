import DashboardLayout from "../../layouts/DashboardLayout";
import Buttons from "../../components/Buttons";
import Form from "../../components/Form";
import { useNavigate } from "react-router-dom";

export default function AddStudent() {
  const navigate = useNavigate();

  const handleSave = () => {
    document.getElementById("form-submit-trigger")?.click();
  };

  return (
    <DashboardLayout>
      <section className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl text-[#701366]">Add Student</h1>
        <Buttons cancelPath="/Students" onSave={handleSave} />
      </section>
      <Form onSuccess={() => navigate("/Students")} />
    </DashboardLayout>
  );
}