import { useState, useEffect } from "react";
import Student_layout from "../../layouts/Student_layout";
import { apiFetch } from "../../services/api";

// ── Read-only field ──────────────────────────────────────────────────────────
const ReadField = ({ label, value, full = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(full ? { gridColumn: "1 / -1" } : {}), minWidth: 0 }}>
    {label && <label style={{ fontSize: "13px", color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>{label}</label>}
    <div style={{ width: "100%", border: "1px solid #e2d0e2", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#701366", boxSizing: "border-box", fontFamily: "Inter, sans-serif", backgroundColor: "#faf5fa", minHeight: "40px" }}>
      {value || <span style={{ color: "#c9a8c9" }}>—</span>}
    </div>
  </div>
);

// ── Gender ───────────────────────────────────────────────────────────────────
const GenderField = ({ value }) => {
  const val = value?.toLowerCase();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
      <label style={{ fontSize: "13px", color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>Gender</label>
      <div style={{ display: "flex", alignItems: "center", gap: "24px", padding: "8px 0", fontSize: "14px", fontFamily: "Inter, sans-serif", color: "#701366" }}>
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

// ── Relationship ─────────────────────────────────────────────────────────────
const RelationshipField = ({ value }) => {
  const fixed   = ["Father", "Mother", "Other"];
  const isOther = value && !["father", "mother"].includes(value.toLowerCase());
  const selected = isOther ? "Other" : value;
  return (
    <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>Relationship Type</label>
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

// ── Card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ title, children }) => (
  <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", boxSizing: "border-box", width: "100%", minWidth: 0 }}>
    <h3 style={{ fontSize: "17px", fontWeight: 500, color: "#701366", borderBottom: "1px solid #f0e0ee", margin: "0 0 20px 0", paddingBottom: "12px", fontFamily: "Inter, sans-serif" }}>
      {title}
    </h3>
    {children}
  </div>
);

// ── Page 
const Profile_student = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    apiFetch("/account/me/")
      .then(r => r.json())
      .then(account => {
        const personId = account?.person_id ?? null;
        if (!personId) throw new Error("Could not resolve student ID.");
        return apiFetch(`/persons/students/${personId}/`);
      })
      .then(r => r.json())
      .then(data => setStudent(data))
      .catch(err => setError(err.message || "Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  // ── Map API response fields ──────────────────────────────────────────────
  // Adjust these paths to match your actual API response structure.
  //
  // Expected shape (example):
  // {
  //   person:     { first_name, last_name, gender, dob, phone, email, address },
  //   class_name: "...",   ← or "class_group", "grade", etc.
  //   special_case: "...",
  //   status:     "Active" | "Inactive",
  //   parent: {
  //     first_name, last_name, relationship, phone
  //   },
  //   account: { username }
  // }

  const person      = student?.person ?? {};
  const firstName   = person.first_name  ?? "";
  const lastName    = person.last_name   ?? "";
  const fullName    = `${firstName} ${lastName}`.trim();
  const status      = student?.status ?? "";

  // Parent — adjust key names to match your serializer
  const parent      = student?.parent ?? student?.guardian ?? {};

  // ── Loading / Error states ───────────────────────────────────────────────
  if (loading) return (
    <Student_layout>
      <div style={{ textAlign: "center", padding: "80px", color: "#b48ab0", fontFamily: "Inter, sans-serif" }}>
        Loading...
      </div>
    </Student_layout>
  );

  if (error) return (
    <Student_layout>
      <div style={{ textAlign: "center", padding: "80px", color: "#dc2626", fontFamily: "Inter, sans-serif" }}>
        {error}
      </div>
    </Student_layout>
  );

  return (
    <Student_layout>
      <div style={{ maxWidth: "1700px", margin: "0 auto", padding: "10px 16px", display: "flex", flexDirection: "column", gap: "24px", fontFamily: "Inter, sans-serif" }}>

        <h2 style={{ fontSize: "24px", color: "#701366", margin: 0 }}>My Profile</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", alignItems: "start" }}>

          {/* ── LEFT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", minWidth: 0 }}>

            {/* Basic Info */}
            <Card title="Basic Information">
              {/* Avatar + name + status */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#f8e0f8", color: "#701366", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {firstName.charAt(0) || "S"}
                </div>
                <div>
                  <p style={{ color: "#701366", fontSize: "16px", margin: "0 0 4px 0" }}>{fullName || "—"}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 12px", borderRadius: "9999px", fontSize: "12px", background: status === "Active" ? "#dcfce7" : "#fee2e2", color: status === "Active" ? "#15803d" : "#dc2626" }}>
                    {status || "Unknown"}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <ReadField label="First Name"    value={firstName} />
                <ReadField label="Last Name"     value={lastName} />
                <GenderField                     value={person.gender} />
                <ReadField label="Date of Birth" value={person.dob ?? student?.dob} />
                {/* Adjust key: class_name / class_group / grade depending on your model */}
                
                <ReadField label="Special Case"  value={student?.special_case} />
              </div>
            </Card>

            {/* Parent Details */}
            <Card title="Parent Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <ReadField label="Parent First Name" value={parent.first_name} />
                <ReadField label="Parent Last Name"  value={parent.last_name} />
                <RelationshipField                   value={parent.relationship} />
                {/* Adjust key: phone / contact / phone_number depending on your model */}
                <ReadField label="Parent Contact" value={parent.phone ?? parent.contact ?? parent.phone_number} full />
              </div>
            </Card>

          </div>

          {/* ── RIGHT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", minWidth: 0 }}>

            {/* Account */}
            

            {/* Contact */}
            <Card title="Contact Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <ReadField label="Phone"   value={person.phone} />
                <ReadField label="Email"   value={person.email} />
                <ReadField label="Address" value={person.address} full />
              </div>
            </Card>

          </div>
        </div>
      </div>
    </Student_layout>
  );
};

export default Profile_student;