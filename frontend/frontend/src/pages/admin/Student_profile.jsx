import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import Form from "../../components/Form";
import Buttons from "../../components/Buttons";

export default function Student_profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  const studentTabs = [
    { name: "Profile", path: "/Student_profile" },
    { name: "Classes", path: "/Student_classes" },
    { name: "Payment", path: "/Payment_student" },
    { name: "Attendance", path: "/Attendance_student" },
  ];

  return (
    <DashboardLayout>
  <div className="flex flex-col gap-6">

      {/* Title */}
      <h2 className="text-2xl">Student Profile</h2>

    
        {/* Tabs */}
        <div className="w-full lg:w-auto overflow-x-auto">
          <Tabs tabs={studentTabs} />
        </div>

        {/* Cancel Button */}
        <div className="w-full lg:w-auto flex justify-start lg:justify-end">
  <Buttons cancelPath="/Students" showSave={false} />
</div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === "profile" && <Form type="profile" />}
        {activeTab === "payment" && <Form type="payment" />}
        {activeTab === "attendance" && <Form type="attendance" />}
      </div>
    </DashboardLayout>
  );
}