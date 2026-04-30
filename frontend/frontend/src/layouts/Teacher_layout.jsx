import StudentForm from "../components/StudentForm";

export default function Admin() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <StudentForm />
    </div>
  );
}