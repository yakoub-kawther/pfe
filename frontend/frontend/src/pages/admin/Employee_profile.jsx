// import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Buttons from "../../components/Buttons";
// import { apiFetch } from "../../services/api";

const ReadField = ({ label, value, full = false }) => (
  <div className="flex flex-col gap-1.5" style={full ? { gridColumn: "1 / -1" } : {}}>
    {label ? <label className="text-[13px] text-gray-500 font-Inter">{label}</label> : null}
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

// ─── Improved Status Badge ────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active:   { bg: "#dcfce7", color: "#15803d", dot: "#16a34a", label: "Active"   },
    inactive: { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444", label: "Inactive" },
  };
  const s = map[status?.toLowerCase()] ?? map.inactive;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "4px 14px", borderRadius: "9999px", fontSize: "12px",
      fontWeight: 600, fontFamily: "Inter, sans-serif",
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
};

export default function Employee_profile() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const employee  = state?.employee;

  const person   = employee?.person   ?? {};
  const position = employee?.position ?? {};
  const firstName = person.first_name ?? "—";
  const lastName  = person.last_name  ?? "—";
  const fullName  = `${firstName} ${lastName}`.trim();
  const status    = employee?.status  ?? "inactive";
  const account = employee?.account ?? null; 

console.log("employee:", JSON.stringify(employee).slice(0, 500));

  return (
    <DashboardLayout>
      <div className="w-full mx-auto pb-10" style={{ padding: "30px clamp(12px, 2vw, 32px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-[#701366] font-Inter">Employee Profile</h1>
          <Buttons
            cancelPath="/Employees"
            onEdit={() => navigate("/Edit_employee", { state: { employee } })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", alignItems: "start", marginTop: "30px" }}>

          {/* LEFT — Basic Information */}
          <Card title="Basic Information">
            {/* Avatar + name + status */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", padding: "16px", background: "#faf5fa", borderRadius: "12px", border: "1px solid #f0e0f0" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "50%",
                background: "linear-gradient(135deg, #f8e0f8, #e8c0e4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#701366", fontWeight: 700, fontSize: "20px",
                fontFamily: "Inter, sans-serif", flexShrink: 0,
                boxShadow: "0 2px 8px rgba(112,19,102,0.15)",
              }}>
                {firstName.charAt(0).toUpperCase() || "E"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ color: "#701366", fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 600, margin: 0 }}>
                  {fullName}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StatusBadge status={status} />
                  {position.name && (
                    <span style={{ fontSize: "12px", color: "#9c5094", fontFamily: "Inter, sans-serif", background: "#f8e0f8", padding: "3px 10px", borderRadius: "9999px" }}>
                      {position.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: "18px" }}>
              <ReadField label="First Name" value={firstName} />
              <ReadField label="Last Name"  value={lastName} />
              <ReadField label="Gender"     value={person.gender ? person.gender.charAt(0).toUpperCase() + person.gender.slice(1) : null} />
              <ReadField label="Position"   value={position.name} />
              <ReadField label="Hire Date"  value={employee?.hire_date} />
              <ReadField label="End Date"   value={employee?.end_date} />
            </div>
          </Card>

          {/* RIGHT */}
          <div className="flex flex-col min-w-0" style={{ gap: "24px" }}>

            {/* Contact Information */}
            <Card title="Contact Information">
              <div className="grid grid-cols-2" style={{ gap: "18px" }}>
                <ReadField label="Phone"   value={person.phone} />
                <ReadField label="Email"   value={person.email} />
                <ReadField label="Address" value={person.address} full />
              </div>
            </Card>

            {/* Account Details */}
            <Card title="Login / Account Details">
             { account ? (
                <div className="grid grid-cols-2" style={{ gap: "18px" }}>
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
}