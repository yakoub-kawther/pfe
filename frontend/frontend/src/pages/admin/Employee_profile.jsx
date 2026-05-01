import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Buttons from "../../components/Buttons";

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
    className="bg-white rounded-2xl border border-gray-100 min-w-0"
    style={{ padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <h3 className="text-[#701366] font-Inter" style={{ fontSize: "16px", marginBottom: "20px" }}>
      {title}
    </h3>
    {children}
  </div>
);


export default function Employee_profile() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const employee  = state?.employee;

  const nameParts = employee?.name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName  = nameParts.slice(1).join(" ") || "";

  return (
    <DashboardLayout>
      <div className="w-full mx-auto pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

        {/* Header  */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[#701366] font-Inter">Employee Profile</h1>
          <Buttons
            cancelPath="/Employees"
            onEdit={() => navigate("/Edit_employee", { state: { employee } })}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
            alignItems: "start",
            marginTop: "30px",
          }}
        >

          {/* LEFT — Basic Information */}
          <Card title="Basic Information">
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

          {/* RIGHT — Contact Information  */}
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