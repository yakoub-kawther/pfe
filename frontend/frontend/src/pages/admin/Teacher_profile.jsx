import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Tabs from "../../components/Tabs";

const ReadField = ({ label, value, full = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(full ? { gridColumn: "1 / -1" } : {}), minWidth: 0 }}>
    {label ? <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>{label}</label> : null}
    <div style={{
      width: "100%", border: "1px solid #e2d0e2", borderRadius: "8px",
      padding: "10px 14px", fontSize: "14px", color: "#701366",
      boxSizing: "border-box", fontFamily: "Inter, sans-serif",
      backgroundColor: "#faf5fa", minHeight: "40px",
    }}>
      {value || <span style={{ color: "#c9a8c9" }}>—</span>}
    </div>
  </div>
);

const Card = ({ title, children }) => (
  <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f3f4f6", padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", boxSizing: "border-box", width: "100%", minWidth: 0 }}>
    <h3 style={{ fontSize: "16px", color: "#701366", fontFamily: "Inter, sans-serif", marginBottom: "20px", margin: "0 0 20px 0" }}>{title}</h3>
    {children}
  </div>
);

const btnStyle = { width: "80px", height: "32px", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "14px", borderRadius: "8px", cursor: "pointer", border: "1px solid #701366", transition: "background 0.15s, color 0.15s", fontFamily: "Inter, sans-serif" };

const Teacher_profile = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const teacher   = state?.teacher;

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
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0, flexShrink: 0 }}>Teacher Profile</h2>

        {/* Tabs + Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexShrink: 0, minWidth: 0 }}>
          <Tabs tabs={teacherTabs} />
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => navigate("/Teachers")}
              style={{ ...btnStyle, background: "white", color: "#701366" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
            >Back</button>
            <button
              onClick={() => navigate("/Edit_teacher", { state: { teacher } })}
              style={{ ...btnStyle, background: "#701366", color: "white" }}
              onMouseEnter={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
            >Edit</button>
          </div>
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start", minWidth: 0 }}>

          {/* LEFT */}
          <Card title="Basic Information">
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#f8e0f8", color: "#701366", fontFamily: "Inter, sans-serif", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {teacher?.name?.charAt(0) || "T"}
              </div>
              <div>
                <p style={{ color: "#701366", fontFamily: "Inter, sans-serif", fontSize: "16px", margin: "0 0 4px 0" }}>{teacher?.name || "—"}</p>
                <span style={{
                  display: "inline-flex", alignItems: "center", padding: "2px 12px", borderRadius: "9999px", fontSize: "12px",
                  background: teacher?.status === "Active" ? "#dcfce7" : "#fee2e2",
                  color:      teacher?.status === "Active" ? "#15803d"  : "#dc2626",
                }}>
                  {teacher?.status || "Unknown"}
                </span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <ReadField label="First Name"    value={firstName} />
              <ReadField label="Last Name"     value={lastName} />
              <ReadField label="Gender"        value={teacher?.gender} />
              <ReadField label="Date of Birth" value={teacher?.dob} />
              <ReadField label="Language"      value={teacher?.language} />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>Head Teacher</label>
                <div style={{ padding: "6px 0" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: "Inter, sans-serif",
                    background: teacher?.head_teacher ? "#f8e0f8" : "#e5e7eb",
                    color:      teacher?.head_teacher ? "#701366"  : "#4b5563",
                  }}>
                    {teacher?.head_teacher ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card title="Login/Account Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ReadField value={teacher?.username} />
                <ReadField value="••••••••" />
              </div>
            </Card>
            <Card title="Contact Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
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