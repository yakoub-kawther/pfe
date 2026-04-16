import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import  Tabs from "../components/Tabs";
import  Form  from "../components/Form";
import Buttons from "../components/Buttons";



export default function Student_profile() {
    const [activeTab, setActiveTab] = useState("profile");
   
const studentTabs = [
  { name: "Profile", path: "/Student_profile" },
  { name: "Classes", path: "/Student_classes" },
  { name: "Payment", path: "/Payment_student" },
  { name: "Attendance", path: "/Attendance_student" },
];

  return (
    <DashboardLayout>
        <h2 className="text-2xl">Student Profile</h2>

        <div className="flex justify-between gap-6 ">
          <Tabs tabs={studentTabs} />
         <Buttons activeTab={activeTab} setActiveTab={setActiveTab} />
       </div> 

      {activeTab === "profile" && <Form type="profile" />}
      {activeTab === "payment" && <Form type="payment" />}
      {activeTab === "attendance" && <Form type="attendance" />}
     
    </DashboardLayout>
  );
}