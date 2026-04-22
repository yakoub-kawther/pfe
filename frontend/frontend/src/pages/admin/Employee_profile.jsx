import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

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

const btnBase    = "inline-flex items-center justify-center px-5 py-1.5 text-sm h-7 w-12 rounded-lg border transition-colors font-Inter";
const btnOutline = `${btnBase} border-[#701366] text-[#701366] bg-white h-7 w-12 hover:bg-[#701366] hover:text-white`;
const btnFilled  = `${btnBase} border-[#701366] text-white bg-[#701366] hover:text-[#701366] hover:bg-white`;

export default function Employee_profile() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const employee  = state?.employee;

  const nameParts = employee?.name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName  = nameParts.slice(1).join(" ") || "";

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-10" style={{ padding: "30px 16px" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8" >
          <h1 className="text-2xl text-[#701366] font-Inter">Employee Profile</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate("/Employees")} className={btnOutline} >Back</button>
            <button onClick={() => navigate("/Edit_employee", { state: { employee } })} className={btnFilled}>Edit</button>
          </div>
        </div>

        <div className="grid grid-cols-2" style={{ gap: "24px", alignItems: "start", marginTop: "30px"  }}>

          {/* LEFT — Basic Information */}
          <Card title="Basic Information">

            {/* Avatar + status */}
            <div className="flex items-center gap-4 mb-5">
              <div
                className="flex items-center justify-center rounded-full bg-[#f8e0f8] text-[#701366] font-bold text-xl"
                style={{ width: "52px", height: "52px", flexShrink: 0 }}
              >
                {employee?.name?.charAt(0) || "E"}
              </div>
              <div>
                <p className="text-[#701366] font-Inter text-base leading-tight">{employee?.name || "—"}</p>
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs mt-1 ${statusStyles[employee?.status] || "bg-gray-100 text-gray-600"}`}>
                  {employee?.status || "Unknown"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: "18px" }}>
              <ReadField label="First Name"    value={firstName} />
              <ReadField label="Last Name"     value={lastName} />
              <ReadField label="Gender"        value={employee?.gender} />
              <ReadField label="Date of Birth" value={employee?.dob} />
              <ReadField label="Position"      value={employee?.position} />
              <ReadField label="Hire Date"     value={employee?.hireDate} />
            </div>
          </Card>

          {/* RIGHT — Contact only */}
          <Card title="Contact Information">
            <div className="grid grid-cols-2" style={{ gap: "18px" }}>
              <ReadField label="Phone"   value={employee?.phone} />
              <ReadField label="Email"   value={employee?.email} />
              <ReadField label="Address" value={employee?.address} full />
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}