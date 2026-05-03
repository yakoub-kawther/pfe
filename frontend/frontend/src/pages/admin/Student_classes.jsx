import { useLocation } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import Buttons from "../../components/Buttons";
import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";

const statusStyles = {
  "confirmed" : "bg-[#F8E0F8] text-[#701366]",
  "promoted"  : "bg-[#701366] text-white",
  "cancelled" : "bg-[#fee2e2] text-[#dc2626]",
  "repeated"  : "bg-[#fef9c3] text-[#854d0e]",
};

export default function StudentClasses() {
  const { state }  = useLocation();
  const student    = state?.student;
  const studentId  = student?.person?.id;

  const [inscriptions, setInscriptions] = useState([]);
  const [loading,      setLoading]      = useState(true);

  const studentTabs = [
    { name: "Profile",    path: "/Student_profile",    state: { student } },
    { name: "Classes",    path: "/Student_classes",    state: { student } },
    { name: "Payment",    path: "/Payment_student",    state: { student } },
    { name: "Attendance", path: "/Attendance_student", state: { student } },
  ];

  useEffect(() => {
  if (!studentId) return;
  console.log("studentId:", studentId);
  console.log("student:", student);
  console.log("studentId:", studentId);
  if (!studentId) {
    console.log("NO STUDENT ID — skipping fetch");
    return;
  }
  apiFetch(`/inscriptions/student/${studentId}/history/`)
    .then(r => r.json())
    .then(data => {
      console.log("Inscriptions:", JSON.stringify(data, null, 2));
      setInscriptions(Array.isArray(data.history) ? data.history : []);
    })
    .catch(() => {})
    .finally(() => setLoading(false));
}, [studentId]);




  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        <h2 className="text-2xl" style={{ color: "#701366", fontFamily: "Inter, sans-serif" }}>
          Classes {student?.person?.first_name} {student?.person?.last_name}
        </h2>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs tabs={studentTabs} />
          <Buttons cancelPath="/Students" showSave={false} />
        </div>

        <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8E0F8] h-12 text-[#701366] font-Inter text-left">
                  <th className="py-3 text-sm font-Inter" style={{ paddingLeft: "30px" }}>Language</th>
                  <th className="px-4 py-3 text-sm font-Inter">Level</th>
                  <th className="px-4 py-3 text-sm font-Inter">Class</th>
                  <th className="px-4 py-3 text-sm font-Inter">Date</th>
                  <th className="px-4 py-3 text-sm font-Inter">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8e0f8]">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-[#701366] opacity-50">Loading...</td></tr>
                ) : inscriptions.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-[#701366] opacity-50">No classes found.</td></tr>
                ) : inscriptions.map((ins, idx) => (
                  <tr key={idx} className="hover:bg-[#fffafe] transition-colors duration-100 h-12">
                    <td className="py-3 text-[#701366]" style={{ paddingLeft: "30px" }}>
  {ins.class_info?.language ?? "—"}
</td>
<td className="px-4 py-3 text-[#701366]">{ins.class_info?.level ?? "—"}</td>
<td className="px-4 py-3 text-[#701366]">{ins.class_info?.name  ?? "—"}</td>
<td className="px-4 py-3 text-[#701366]">{ins.inscription_date?.split("T")[0] ?? "—"}</td>
<td className="px-4 py-3">
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-Inter ${statusStyles[ins.status] ?? "bg-gray-100 text-gray-600"}`}>
    {ins.status}
  </span>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}