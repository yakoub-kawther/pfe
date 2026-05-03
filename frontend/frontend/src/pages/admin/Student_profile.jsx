import { useLocation } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import Buttons from "../../components/Buttons";

const ReadField = ({ label, value, full = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(full ? { gridColumn: "1 / -1" } : {}), minWidth: 0 }}>
    {label && <label style={{ fontSize: "13px", color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>{label}</label>}
    <div style={{ width: "100%", border: "1px solid #e2d0e2", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#701366", boxSizing: "border-box", fontFamily: "Inter, sans-serif", backgroundColor: "#faf5fa", minHeight: "40px" }}>
      {value || <span style={{ color: "#c9a8c9" }}>—</span>}
    </div>
  </div>
);

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

const Card = ({ title, children }) => (
  <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", boxSizing: "border-box", width: "100%", minWidth: 0 }}>
    <h3 style={{ fontSize: "17px", fontWeight: 500, color: "#701366", borderBottom: "1px solid #f0e0ee", margin: "0 0 20px 0", paddingBottom: "12px", fontFamily: "Inter, sans-serif" }}>
      {title}
    </h3>
    {children}
  </div>
);

export default function Student_profile() {
  const { state } = useLocation();
  const student   = state?.student;

  // ✅ Inside component so student is accessible
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
  const status      = student?.status           ?? "Active";

  const parentParts     = parentName.trim().split(" ");
  const parentFirstName = parentParts[0] ?? "";
  const parentLastName  = parentParts.slice(1).join(" ") ?? "";
  const relationship    = student?.parent_relationship ?? "";

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl" style={{ color: "#701366", fontFamily: "Inter, sans-serif" }}>Student Profile</h2>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs tabs={studentTabs} />
          <Buttons cancelPath="/Students" showSave={false} />
        </div>
      </div>

      <div style={{ maxWidth: "1700px", margin: "16px auto 0", padding: "0 16px", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", alignItems: "start" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", minWidth: 0 }}>
            <Card title="Basic Information">
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#f8e0f8", color: "#701366", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {firstName.charAt(0) || "S"}
                </div>
                <div>
                  <p style={{ color: "#701366", fontSize: "16px", margin: "0 0 4px 0" }}>{fullName || "—"}</p>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 12px", borderRadius: "9999px", fontSize: "12px", background: status === "Active" ? "#dcfce7" : "#fee2e2", color: status === "Active" ? "#15803d" : "#dc2626" }}>
                    {status}
                  </span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <ReadField label="First Name"    value={firstName} />
                <ReadField label="Last Name"     value={lastName} />
                <GenderField                     value={gender} />
                <ReadField label="Date of Birth" value={dob} />
                <ReadField label="Class"         value={className} />
                <ReadField label="Special Case"  value={specialCase} />
              </div>
            </Card>

            <Card title="Parent Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <ReadField label="Parent First Name" value={parentFirstName} />
                <ReadField label="Parent Last Name"  value={parentLastName} />
                <RelationshipField                   value={relationship} />
                <ReadField label="Parent Contact"    value={student?.parent_phone} full />
              </div>
            </Card>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", minWidth: 0 }}>
            <Card title="Account Information">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <ReadField label="Username" value={username} />
                <ReadField label="Password" value="••••••••" />
              </div>
            </Card>

            <Card title="Contact Details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
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






// import { useLocation } from "react-router-dom";
// import DashboardLayout from "../../layouts/DashboardLayout";
// import Tabs from "../../components/Tabs";
// import Buttons from "../../components/Buttons";
// import { useEffect, useState } from "react";
// import { apiFetch } from "../../services/api";

// const statusStyles = {
//   "confirmed" : "bg-[#F8E0F8] text-[#701366]",
//   "promoted"  : "bg-[#701366] text-white",
//   "cancelled" : "bg-[#fee2e2] text-[#dc2626]",
//   "repeated"  : "bg-[#fef9c3] text-[#854d0e]",
// };

// export default function StudentClasses() {
//   const { state }  = useLocation();
//   const student    = state?.student;
//   const studentId  = student?.person?.id;

//   const [inscriptions, setInscriptions] = useState([]);
//   const [loading,      setLoading]      = useState(true);

//   const studentTabs = [
//     { name: "Profile",    path: "/Student_profile",    state: { student } },
//     { name: "Classes",    path: "/Student_classes",    state: { student } },
//     { name: "Payment",    path: "/Payment_student",    state: { student } },
//     { name: "Attendance", path: "/Attendance_student", state: { student } },
//   ];

//   useEffect(() => {
//     if (!studentId) return;
//     console.log("studentId:", studentId);
//     apiFetch(`/inscriptions/?student_id=${studentId}`)
//       .then(r => r.json())
//       .then(data => setInscriptions(Array.isArray(data) ? data : (data.results ?? [])))
//       .catch(() => {})
//       .finally(() => setLoading(false));
      
//   }, [studentId]);

//   return (
//     <DashboardLayout>
//       <div className="flex flex-col gap-6">

//         <h2 className="text-2xl" style={{ color: "#701366", fontFamily: "Inter, sans-serif" }}>
//           Classes {student?.person?.first_name} {student?.person?.last_name}
//         </h2>

//         <div className="flex items-center justify-between gap-4 flex-wrap">
//           <Tabs tabs={studentTabs} />
//           <Buttons cancelPath="/Students" showSave={false} />
//         </div>

//         <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-[#F8E0F8] h-12 text-[#701366] font-Inter text-left">
//                   <th className="py-3 text-sm font-Inter" style={{ paddingLeft: "30px" }}>Language</th>
//                   <th className="px-4 py-3 text-sm font-Inter">Level</th>
//                   <th className="px-4 py-3 text-sm font-Inter">Class</th>
//                   <th className="px-4 py-3 text-sm font-Inter">Date</th>
//                   <th className="px-4 py-3 text-sm font-Inter">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-[#f8e0f8]">
//                 {loading ? (
//                   <tr><td colSpan={5} className="text-center py-8 text-[#701366] opacity-50">Loading...</td></tr>
//                 ) : inscriptions.length === 0 ? (
//                   <tr><td colSpan={5} className="text-center py-8 text-[#701366] opacity-50">No classes found.</td></tr>
//                 ) : inscriptions.map((ins, idx) => (
//                   <tr key={idx} className="hover:bg-[#fffafe] transition-colors duration-100 h-12">
//                     <td className="py-3 text-[#701366]" style={{ paddingLeft: "30px" }}>
//                       {ins.enrolled_class?.language ?? ins.language ?? "—"}
//                     </td>
//                     <td className="px-4 py-3 text-[#701366]">{ins.enrolled_class?.level ?? ins.level ?? "—"}</td>
//                     <td className="px-4 py-3 text-[#701366]">{ins.enrolled_class?.name  ?? ins.class_name ?? "—"}</td>
//                     <td className="px-4 py-3 text-[#701366]">{ins.inscription_date?.split("T")[0] ?? "—"}</td>
//                     <td className="px-4 py-3">
//                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-Inter ${statusStyles[ins.status] ?? "bg-gray-100 text-gray-600"}`}>
//                         {ins.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }