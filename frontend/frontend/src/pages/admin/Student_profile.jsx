import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Tabs from "../../components/Tabs";
import Form from "../../components/Form";

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
      {/* Title */}
      <h2 className="text-2xl">Student Profile</h2>

      {/* Tabs + Button */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">

        {/* Tabs */}
        <div className="w-full lg:w-auto overflow-x-auto">
          <Tabs tabs={studentTabs} />
        </div>

        {/* Cancel Button */}
        <div className="w-full lg:w-auto flex justify-start lg:justify-end">
          <button
            onClick={() => navigate("/students")}
            className="px-4 py-2 bg-[#701366] border border-[#701366] text-white hover:bg-white hover:text-[#701366] rounded-lg"
          >
            Cancel
          </button>
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