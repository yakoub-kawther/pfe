import DashboardLayout from "../components/DashboardLayout";
import  Tabs from "../components/Tabs";



export default function Payment_student() {

  const studentTabs = [
  { name: "Profile", path: "/Student_profile" },
  { name: "Classes", path: "/Student_classes" },
  { name: "Payment", path: "/Payment_student" },
  { name: "Attendance", path: "/Attendance_student" },
];
  return (
    <DashboardLayout>
      <h2 className="text-2xl">Payment</h2>
      <Tabs tabs={studentTabs} />
    </DashboardLayout>
  );
}