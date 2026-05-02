import { useLocation } from "react-router-dom";
import Secretary_layout from "../../layouts/Secretary_layout";
import Tabs from "../../components/Tabs";
import Buttons from "../../components/Buttons";

// ── Read-only field ──────────────────────────────────────────────────────────
const ReadField = ({ label, value, full = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(full ? { gridColumn: "1 / -1" } : {}), minWidth: 0 }}>
    {label && <label style={{ fontSize: "13px", color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>{label}</label>}
    <div style={{ width: "100%", border: "1px solid #e2d0e2", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#701366", boxSizing: "border-box", fontFamily: "Inter, sans-serif", backgroundColor: "#faf5fa", minHeight: "40px" }}>
      {value || <span style={{ color: "#c9a8c9" }}>—</span>}
    </div>
  </div>
);

// ── Gender — read-only radios ────────────────────────────────────────────────
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

// ── Relationship — read-only radios ─────────────────────────────────────────
const RelationshipField = ({ value }) => {
  const fixed    = ["Father", "Mother", "Other"];
  const isOther  = value && !["father", "mother"].includes(value.toLowerCase());
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

const studentTabs = [
  { name: "Profile",    path: "/Student_profile_secretary"    },
  { name: "Classes",    path: "/Student_classes_secretary"    },
  { name: "Payment",    path: "/Payment_student_secretary"    },
  { name: "Attendance", path: "/Attendance_student_secretary" },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Student_profile_secretary() {
  const { state } = useLocation();
  const student   = state?.student;
  const nameParts = student?.name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName  = nameParts.slice(1).join(" ") || "";

  return (
    <Secretary_layout>
      <div className="flex flex-col gap-6">

        {/* Title */}
        <h2 className="text-2xl" style={{ color: "#701366", fontFamily: "Inter, sans-serif" }}>Student Profile</h2>

        {/* Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs tabs={studentTabs} />
                  {/* Cancel button */}
        <div className="w-full lg:w-auto flex justify-start lg:justify-end">
          <Buttons cancelPath="/Student_secretary" showSave={false} />
        </div>
        </div>



      </div>

      {/* Content */}
      <div style={{ maxWidth: "1700px", margin: "16px auto 0", padding: "0 16px", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", alignItems: "start" }}>

          {/* ── LEFT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", minWidth: 0 }}>

            {/* Basic Info */}
            <Card title="Basic Information">
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#f8e0f8", color: "#701366", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {student?.name?.charAt(0) || "S"}
                </div>
                <div>
                  <p style={{ color: "#701366", fontSize: "16px", margin: "0 0 4px 0" }}>{student?.name || "—"}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 12px", borderRadius: "9999px", fontSize: "12px", background: student?.status === "Active" ? "#dcfce7" : "#fee2e2", color: student?.status === "Active" ? "#15803d" : "#dc2626" }}>
                    {student?.status || "Unknown"}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <ReadField label="First Name"    value={firstName} />
                <ReadField label="Last Name"     value={lastName} />
                <GenderField                     value={student?.gender} />
                <ReadField label="Date of Birth" value={student?.dob} />
                <ReadField label="Class"         value={student?.class} />
                <ReadField label="Special Case"  value={student?.special_case} />
              </div>
            </Card>

            {/* Parent Details */}
            <Card title="Parent Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <ReadField label="Parent First Name" value={student?.parent_first_name} />
                <ReadField label="Parent Last Name"  value={student?.parent_last_name} />
                <RelationshipField                   value={student?.relationship} />
                <ReadField label="Parent Contact"    value={student?.parent_phone} full />
              </div>
            </Card>

          </div>

          {/* ── RIGHT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", minWidth: 0 }}>

            {/* Account */}
            <Card title="Account Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <ReadField label="Username" value={student?.username} />
                <ReadField label="Password" value="••••••••" />
              </div>
            </Card>

            {/* Contact */}
            <Card title="Contact Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <ReadField label="Phone"   value={student?.phone} />
                <ReadField label="Email"   value={student?.email} />
                <ReadField label="Address" value={student?.address} full />
              </div>
            </Card>

          </div>
        </div>
      </div>
    </Secretary_layout>
  );
}