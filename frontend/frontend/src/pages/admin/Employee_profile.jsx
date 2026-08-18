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

const Card = ({ title, children }) => (
  <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f3f4f6", padding: "24px 28px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", boxSizing: "border-box", width: "100%", minWidth: 0 }}>
    <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", fontFamily: "Inter, sans-serif", marginBottom: "20px", margin: "0 0 20px 0" }}>{title}</h3>
    {children}
  </div>
);

const statusStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 600,
  display: "inline-block",
  background: status === "active" ? "#e6f7ec" : "#fdecea",
  color: status === "active" ? "#1a7f4b" : "#c92c2c",
  textTransform: "capitalize",
});

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

const Employee_profile = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const employee  = state?.employee;

  // ─── Extract nested fields ────────────────────────────────
  const person   = employee?.person   ?? {};
  const position = employee?.position ?? {};
  const account  = employee?.account  ?? null;
  const fullName = `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();
  const status   = (employee?.status ?? "").toLowerCase();
  const gender = person.gender
    ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1)
    : "—";

  const employeeTabs = [
    { name: "Profile", path: "/Employee_profile", state: { employee } },
    { name: "Payment", path: "/Employee_payment", state: { employee } },
  ];

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
          <button
            onClick={() => navigate("/Employees")}
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
              Employee Profile
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", flexShrink: 0, minWidth: 0 }}>
          <Tabs tabs={employeeTabs} />
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start", minWidth: 0 }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card title="Personal Information">
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
                <ReadField label="First Name" value={person.first_name} />
                <ReadField label="Last Name"  value={person.last_name} />
                <ReadField label="Gender"     value={gender} />
                <ReadField label="Position"   value={position.name} />
                <ReadField label="Hire Date"  value={employee?.hire_date} />
                <ReadField label="End Date"   value={employee?.end_date} />
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card title="Contact Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ReadField label="Phone"   value={person.phone} />
                <ReadField label="Email"   value={person.email} />
                <ReadField label="Address" value={person.address} full />
              </div>
            </Card>

            <Card title="Account Information">
              {account ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <ReadField label="Username" value={account.username} />
                  <ReadField label="Role"     value={account.role} />
                </div>
              ) : (
                <div style={{ padding: "14px", background: "#fef2f2", borderRadius: "8px", fontSize: "13px", color: "#991b1b", fontFamily: "Inter, sans-serif" }}>
                  No account linked to this employee.
                </div>
              )}
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Employee_profile;