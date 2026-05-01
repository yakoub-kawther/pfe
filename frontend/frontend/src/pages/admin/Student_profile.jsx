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
    { name: "Profile",    path: "/Student_profile"    },
    { name: "Classes",    path: "/Student_classes"    },
    { name: "Payment",    path: "/Payment_student"    },
    { name: "Attendance", path: "/Attendance_student" },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        {/* Title */}
        <h2 className="text-2xl">Student Profile</h2>

        {/* Tabs + Cancel on the same line */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs tabs={studentTabs} />
          <Buttons cancelPath="/Students" showSave={false} />
        </div>

      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === "profile"    && <Form type="profile"    />}
        {activeTab === "payment"    && <Form type="payment"    />}
        {activeTab === "attendance" && <Form type="attendance" />}
      </div>
    </DashboardLayout>
  );
}