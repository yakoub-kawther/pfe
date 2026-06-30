import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Student_layout from "../../layouts/Student_layout";
import { apiFetch } from "../../services/api";

const statusStyles = {
  present: "bg-green-100 text-green-600",
  absent:  "bg-red-100 text-red-600",
};

const statusLabel = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Attendance_detail_student() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const cls        = state?.cls;
  const studentId  = state?.studentId; // pass this when navigating

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);

  // ── Fetch attendance ──────────────────────────────────────
  useEffect(() => {
    console.log("cls:", cls, "studentId:", studentId);

    if (!cls?.id || !studentId) {
    console.log("missing cls.id or studentId — skipping fetch");  // ← add this
    return;
  }

    const fetch = async () => {
      setLoading(true);
      try {
        const res  = await apiFetch(`/attendance/student/${studentId}/class/${cls.id}/`);
        const data = await res.json();
        console.log("attendance response:", data);
        setAttendanceData(Array.isArray(data) ? data : (data.results ?? []));
      } catch {
        console.log("attendance error:");
        setError("Failed to load attendance.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [cls?.id, studentId]);

  // ── Stats ─────────────────────────────────────────────────
  const total   = attendanceData.length;
  const present = attendanceData.filter(a => a.status === "present").length;
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;

  const radius       = 60;
  const stroke       = 12;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (percent / 100) * circumference;

  return (
    <Student_layout>
      <div className="flex flex-col gap-6" style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "#fdf4fd", border: "1px solid #f0d8ee", borderRadius: "10px", padding: "6px 14px", color: "#701366", fontSize: "13px", cursor: "pointer", fontWeight: 450 }}
          >
            ← Back
          </button>
          <div>
            <h2 className="text-2xl font-Inter text-[#701366]">
              Attendance — {cls?.name ?? "Class"}
            </h2>
            <p style={{ fontSize: "13px", color: "#b48ab0", margin: "2px 0 0" }}>
              {cls?.language} · {cls?.level} · {cls?.schedule} · {cls?.room}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ color: "#dc2626", background: "#fee2e2", borderRadius: "8px", padding: "10px 16px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        {/* Main */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Table */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: "360px" }}>
                <thead>
                  <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                    <th style={{ paddingLeft: "30px" }} className="py-3 whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f8e0f8]">
                  {loading ? (
                    <tr>
                      <td colSpan={2} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>
                        Loading...
                      </td>
                    </tr>
                  ) : attendanceData.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>
                        No attendance records found.
                      </td>
                    </tr>
                  ) : attendanceData.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fffafe] h-12">
                      <td style={{ paddingLeft: "30px" }} className="py-3 text-[#701366] whitespace-nowrap">
                        {/* ✅ session_date from StudentAttendanceSerializer */}
                        {item.session_date
                          ? new Date(item.session_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        {/* ✅ status from Attendance.Status */}
                        <span className={`px-3 py-1 rounded-full text-xs font-Inter ${statusStyles[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                          ● {statusLabel(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Donut */}
          <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center">
            <h3 className="text-[#701366] mb-4 text-xl font-Inter">Attendance Rate</h3>

            <div className="flex gap-4 text-xs mb-4">
              <div className="flex items-center gap-1 text-[#fde68a]">
                <span className="w-2 h-2 bg-[#fde68a] rounded-full"></span>
                Absent
              </div>
              <div className="flex items-center gap-1 text-[#701366]">
                <span className="w-2 h-2 bg-[#701366] rounded-full"></span>
                Present
              </div>
            </div>

            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={radius} stroke="#fde68a" strokeWidth={stroke} fill="none" />
                <circle cx="75" cy="75" r={radius} stroke="#701366" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" transform="rotate(-90 75 75)" />
                <circle cx="75" cy="75" r={radius} stroke="#fde68a" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - ((100 - percent) / 100) * circumference}
                  strokeLinecap="round" transform={`rotate(${(percent / 100) * 360 - 90} 75 75)`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-Inter text-[#701366]">{percent}%</span>
                <span className="text-xs text-[#701366]">Present</span>
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginTop: "20px", display: "flex", gap: "24px", fontSize: "13px", color: "#701366" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 500 }}>{present}</div>
                <div style={{ color: "#b48ab0" }}>Present</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 500 }}>{total - present}</div>
                <div style={{ color: "#b48ab0" }}>Absent</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 500 }}>{total}</div>
                <div style={{ color: "#b48ab0" }}>Total</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Student_layout>
  );
}