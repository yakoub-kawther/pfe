import { useState, useEffect } from "react";
import Teacher_layout from "../../layouts/Teacher_layout";
import { apiFetch } from "../../services/api";

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
    <h3 style={{ fontSize: "16px", color: "#701366", fontFamily: "Inter, sans-serif", margin: "0 0 20px 0" }}>{title}</h3>
    {children}
  </div>
);

const Profile_teacher = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    // get person_id from account/me
    apiFetch("/account/me/")
      .then(r => r.json())
      .then(account => {
        const personId = account?.person_id ?? null;
        if (!personId) throw new Error("Could not resolve teacher ID.");
        // fetch teacher details
        return apiFetch(`/persons/teachers/${personId}/`);
      })
      .then(r => r.json())
      .then(data => setTeacher(data))
      .catch(err => setError(err.message || "Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const person    = teacher?.employee?.person ?? {};
  const firstName = person.first_name  ?? "";
  const lastName  = person.last_name   ?? "";
  const fullName  = `${firstName} ${lastName}`.trim();
  const status    = (teacher?.employee?.status ?? "").toLowerCase();
  const username  = teacher?.account?.username ?? "";

  if (loading) return (
    <Teacher_layout>
      <div style={{ textAlign: "center", padding: "80px", color: "#b48ab0", fontFamily: "Inter, sans-serif" }}>Loading...</div>
    </Teacher_layout>
  );

  if (error) return (
    <Teacher_layout>
      <div style={{ textAlign: "center", padding: "80px", color: "#dc2626", fontFamily: "Inter, sans-serif" }}>{error}</div>
    </Teacher_layout>
  );

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0 }}>My Profile</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start", minWidth: 0 }}>

          {/* LEFT */}
          <Card title="Basic Information">
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#f8e0f8", color: "#701366", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {firstName.charAt(0) || "T"}
              </div>
              <div>
                <p style={{ color: "#701366", fontSize: "16px", margin: "0 0 6px 0" }}>{fullName || "—"}</p>
                <span style={{
                  display: "inline-flex", alignItems: "center", padding: "2px 12px", borderRadius: "9999px", fontSize: "12px",
                  background: status === "active" ? "#dcfce7" : "#fee2e2",
                  color:      status === "active" ? "#15803d"  : "#dc2626",
                }}>
                  {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <ReadField label="First Name"     value={firstName} />
              <ReadField label="Last Name"      value={lastName} />
              <ReadField label="Gender"         value={person.gender} />
              <ReadField label="Hire Date"      value={teacher?.employee?.hire_date} />
              <ReadField label="Language"       value={teacher?.language?.language_name} />
              <ReadField label="Qualifications" value={teacher?.qualifications} />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>Head Teacher</label>
                <div style={{ padding: "6px 0" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px",
                    background: teacher?.is_head_teacher ? "#f8e0f8" : "#e5e7eb",
                    color:      teacher?.is_head_teacher ? "#701366"  : "#4b5563",
                  }}>
                    {teacher?.is_head_teacher ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              <ReadField label="Position" value={teacher?.employee?.position?.name} />
            </div>
          </Card>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            <Card title="Account Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ReadField label="Username" value={username} />
                <ReadField label="Password" value="••••••••" />
                <ReadField label="Role"     value={teacher?.account?.role} />
              </div>
            </Card>
            <Card title="Contact Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <ReadField label="Phone"   value={person.phone} />
                <ReadField label="Email"   value={person.email} />
                <ReadField label="Address" value={person.address} full />
              </div>
            </Card>
          </div>

        </div>
      </div>
    </Teacher_layout>
  );
};

export default Profile_teacher;