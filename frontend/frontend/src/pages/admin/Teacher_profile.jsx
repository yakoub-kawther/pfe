import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Tabs from "../../components/Tabs";

const statusStyles = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-red-100 text-red-700",
};

const ReadField = ({ label, value, full = false }) => (
  <div className="flex flex-col gap-1.5" style={full ? { gridColumn: "1 / -1" } : {}}>
    {label ? <label className="text-[13px] text-gray-500 font-Inter">{label}</label> : null}
    <div
      style={{
        width: "100%",
        border: "1px solid #e2d0e2",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "14px",
        color: "#701366",
        boxSizing: "border-box",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#faf5fa",
        minHeight: "40px",
      }}
    >
      {value || <span style={{ color: "#c9a8c9" }}>—</span>}
    </div>
  </div>
);

const Card = ({ title, children }) => (
  <div
    className="bg-white rounded-2xl border border-gray-100"
    style={{ padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <h3 className="text-[#701366] font-Inter" style={{ fontSize: "16px", marginBottom: "20px" }}>
      {title}
    </h3>
    {children}
  </div>
);

const btnBase    = "inline-flex items-center justify-center px-5 py-1.5 text-sm w-12 h-7 rounded-lg border transition-colors font-Inter";
const btnOutline = `${btnBase} border-[#701366] text-[#701366] bg-white hover:bg-[#701366] hover:text-white`;
const btnFilled  = `${btnBase} border-[#701366] text-white bg-[#701366] hover:bg-white hover:text-[#701366]`;

const Teacher_profile = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const teacher    = state?.teacher;

  const teacherTabs = [
    { name: "Profile", path: "/Teacher_profile", state: { teacher } },
    { name: "Classes", path: "/Teacher_classes", state: { teacher } },
    { name: "Payment", path: "/Teacher_payment", state: { teacher } },
  ];

  const nameParts = teacher?.name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName  = nameParts.slice(1).join(" ") || "";

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-[#701366] font-Inter">Teacher Profile</h2>
       </div>
         
         
         {/* Tabs + Actions */}
         <div className="flex items-center justify-between w-full">
          
           {/* Tabs */}
            <div className="flex-1 flex justify-start">
             <Tabs tabs={teacherTabs} />
           </div>

           {/* Action Buttons */}
             <div className="flex gap-2  justify-end">
               <button onClick={() => navigate("/Teachers")} className={btnOutline} >Back</button>
                <button onClick={() => navigate("/Edit_teacher", { state: { teacher } })} className={btnFilled}>Edit</button>
            </div>

      </div>
        
        <div className="grid grid-cols-2" style={{ gap: "24px", alignItems: "start" }}>

          {/* LEFT */}
          <Card title="Basic Information">

            {/* Avatar + status */}
            <div className="flex items-center gap-4 mb-5">
              <div
                className="flex items-center justify-center rounded-full bg-[#f8e0f8] text-[#701366] font-Inter text-xl"
                style={{ width: "52px", height: "52px", flexShrink: 0 }}
              >
                {teacher?.name?.charAt(0) || "T"}
              </div>
              <div>
                <p className="text-[#701366] font-Inter text-base leading-tight">{teacher?.name || "—"}</p>
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs mt-1 ${statusStyles[teacher?.status] || "bg-gray-100 text-gray-600"}`}>
                  {teacher?.status || "Unknown"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: "18px" }}>
              <ReadField label="First Name"    value={firstName} />
              <ReadField label="Last Name"     value={lastName} />
              <ReadField label="Gender"        value={teacher?.gender} />
              <ReadField label="Date of Birth" value={teacher?.dob} />
              <ReadField label="Language"      value={teacher?.language} />

              {/* Head Teacher badge */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-gray-500 font-Inter">Head Teacher</label>
                <div style={{ padding: "6px 0" }}>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-Inter ${
                    teacher?.head_teacher ? "bg-[#f8e0f8] text-[#701366]" : "bg-gray-200 text-gray-600"
                  }`}>
                    {teacher?.head_teacher ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* RIGHT */}
          <div className="flex flex-col" style={{ gap: "24px" }}>
            <Card title="Login/Account Details">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <ReadField value={teacher?.username} />
                <ReadField value="••••••••" />
              </div>
            </Card>

            <Card title="Contact Information">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <ReadField label="Phone"   value={teacher?.phone} />
                <ReadField label="Email"   value={teacher?.email} />
                <ReadField label="Address" value={teacher?.address} full />
              </div>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Teacher_profile;