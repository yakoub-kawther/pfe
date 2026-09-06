import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
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

const GenderField = ({ value }) => {
  const val = value?.toLowerCase();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
      <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>Gender</label>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "8px 0", fontSize: "14px", fontFamily: "Inter, sans-serif", color: "#701366" }}>
        {["Male", "Female"].map((opt) => (
          <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "default" }}>
            <input type="radio" readOnly checked={val === opt.toLowerCase()} onChange={() => {}} style={{ accentColor: "#701366", pointerEvents: "none" }} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
};

const RelationshipField = ({ value }) => {
  const fixed    = ["Father", "Mother", "Other"];
  const isOther  = value && !["father", "mother"].includes(value.toLowerCase());
  const selected = isOther ? "Other" : value;
  return (
    <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>Relationship Type</label>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "20px", padding: "8px 0", fontSize: "14px", fontFamily: "Inter, sans-serif", color: "#701366" }}>
        {fixed.map((opt) => (
          <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "default" }}>
            <input type="radio" readOnly checked={selected?.toLowerCase() === opt.toLowerCase()} onChange={() => {}} style={{ accentColor: "#701366", pointerEvents: "none" }} />
            {opt}
          </label>
        ))}
        {isOther && (
          <div style={{ border: "1px solid #e2d0e2", borderRadius: "8px", padding: "6px 14px", fontSize: "14px", color: "#701366", backgroundColor: "#faf5fa", fontFamily: "Inter, sans-serif" }}>
            {value}
          </div>
        )}
      </div>
    </div>
  );
};

const Card = ({ title, children }) => (
  <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f3f4f6", padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", boxSizing: "border-box", width: "100%", minWidth: 0 }}>
    <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", fontFamily: "Inter, sans-serif", marginBottom: "20px", margin: "0 0 20px 0" }}>{title}</h3>
    {children}
  </div>
);

const statusStyle = (status) => {
  const s = (status ?? "pending").toLowerCase();
  const map = {
    active:   { background: "#e6f7ec", color: "#1a7f4b" },
    pending:  { background: "#fdf3d9", color: "#c9971c" },
    inactive: { background: "#fdecea", color: "#c92c2c" },
  };
  const { background, color } = map[s] ?? map.pending;
  return {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
    background,
    color,
    textTransform: "capitalize",
  };
};

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

export default function Student_profile() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const student   = state?.student;

  const studentTabs = [
    { name: "Profile",    path: "/Student_profile",    state: { student } },
    { name: "Classes",    path: "/Student_classes",    state: { student } },
    { name: "Payment",    path: "/Payment_student",    state: { student } },
    { name: "Attendance", path: "/Attendance_student", state: { student } },
  ];

  const person      = student?.person ?? {};
  const firstName   = person.first_name  ?? "";
  const lastName    = person.last_name   ?? "";
  const fullName    = `${firstName} ${lastName}`.trim();
  const gender      = person.gender      ?? "";
  const phone       = person.phone       ?? "";
  const email       = person.email       ?? "";
  const address     = person.address     ?? "";
  const dob         = student?.date_of_birth    ?? "";
  const specialCase = student?.special_case     ?? "";
  const parentName  = student?.parent_name      ?? "";
  const className   = student?.class_name       ?? student?.class ?? "";
  const username    = student?.username         ?? "";
  const status      = (student?.status ?? "pending").toLowerCase();

  const parentParts     = parentName.trim().split(" ");
  const parentFirstName = parentParts[0] ?? "";
  const parentLastName  = parentParts.slice(1).join(" ") ?? "";
  const relationship    = student?.parent_relationship ?? "";

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
          <button
            onClick={() => navigate("/Students")}
            style={backBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#701366",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Student Profile
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", flexShrink: 0, minWidth: 0 }}>
          <Tabs tabs={studentTabs} />
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start", minWidth: 0 }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card title="Basic Information">
              {/* Name + status */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                <p style={{ color: "#701366", opacity: 0.75, fontFamily: "Inter, sans-serif", fontSize: "20px", fontWeight: 700, margin: 0 }}>
                  {fullName || "—"}
                </p>
                <span style={{ ...statusStyle(status), width: "fit-content" }}>
                  {status || "—"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ReadField label="First Name"    value={firstName} />
                <ReadField label="Last Name"     value={lastName} />
                <GenderField                     value={gender} />
                <ReadField label="Date of Birth" value={dob} />
                <ReadField label="Class"         value={className} />
                <ReadField label="Special Case"  value={specialCase} />
              </div>
            </Card>

            <Card title="Parent Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ReadField label="Parent First Name" value={parentFirstName} />
                <ReadField label="Parent Last Name"  value={parentLastName} />
                <RelationshipField                   value={relationship} />
                <ReadField label="Parent Contact"    value={student?.parent_phone} full />
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card title="Account Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ReadField label="Username" value={username} />
                <ReadField label="Password" value="••••••••" />
              </div>
            </Card>

            <Card title="Contact Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ReadField label="Phone"   value={phone} />
                <ReadField label="Email"   value={email} />
                <ReadField label="Address" value={address} full />
              </div>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}