import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Secretary_layout from "../../layouts/Secretary_layout";
import Tabs from "../../components/Tabs";
import Form from "../../components/Form";
import Buttons from "../../components/Buttons";

export default function Student_profile_secretary() {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  const studentTabs = [
    { name: "Profile", path: "/Student_profile_secretary" },
    { name: "Classes", path: "/Student_classes_secretary" },
    { name: "Payment", path: "/Payment_student_secretary" },
    { name: "Attendance", path: "/Attendance_student_secretary" },
  ];

  return (
    <Secretary_layout>
    <div className="flex flex-col gap-6">


      {/* Title */}
      <h2 className="text-2xl">Student Profile</h2>

        {/* Tabs */}
        <div className="w-full lg:w-auto overflow-x-auto">
          <Tabs tabs={studentTabs} />
        </div>

        {/* Cancel Button */}
        <div className="w-full lg:w-auto flex justify-start lg:justify-end">
  <Buttons cancelPath="/Student_secretary" showSave={false} />
</div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === "profile" && <Form type="profile_secretary" />}
        {activeTab === "payment" && <Form type="payment_secretary" />}
        {activeTab === "attendance" && <Form type="attendance" />}
      </div>
    </Secretary_layout>
  );
}