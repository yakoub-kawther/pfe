import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import  {Tabs} from "../components/Tabs";
import  Form  from "../components/Form";
import Buttons from "../components/Buttons";



export default function Student_profile() {
    const [activeTab, setActiveTab] = useState("profile");

  return (
    <DashboardLayout>
        <h2 className="text-2xl">Student Profile</h2>

        <div className="flex justify-between gap-6 ">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
         <Buttons activeTab={activeTab} setActiveTab={setActiveTab} />
       </div> 

      {activeTab === "profile" && <Form type="profile" />}
      {activeTab === "payment" && <Form type="payment" />}
      {activeTab === "attendance" && <Form type="attendance" />}
     
    </DashboardLayout>
  );
}