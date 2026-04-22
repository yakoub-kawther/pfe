import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const BASE_URL = "http://localhost:8000";

export default function Classes_teacher() {
  const { state }  = useLocation();
  const location   = useLocation();
  const navigate   = useNavigate();
  const teacher    = state?.teacher;
  const person_id  = teacher?.employee?.person_id;

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const teacherTabs = [
    { name: "Profile", path: "/Teacher_profile", state: { teacher } },
    { name: "Classes", path: "/Teacher_classes", state: { teacher } },
    { name: "Payment", path: "/Teacher_payment", state: { teacher } },
  ];

  useEffect(() => {
    if (!person_id) { setError("No teacher ID found."); return; }

    const fetchClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/api/academic/classes/?teacher=${person_id}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setClasses(Array.isArray(data) ? data : (data.results ?? []));
      } catch (err) {
        setError(err.message || "Failed to load classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [person_id]);

  const statusBadge = (status) => {
    const cfg = {
      active:    { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", dot: "#16a34a" },
      completed: { bg: "#f8e0f8", color: "#701366", border: "#e9b8e9", dot: "#701366" },
      cancelled: { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca", dot: "#dc2626" },
    };
    const s = cfg[status] ?? { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb", dot: "#9ca3af" };
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "4px 12px", borderRadius: "20px", fontSize: "11px",
        fontWeight: "600", fontFamily: "Inter, sans-serif",
        letterSpacing: "0.03em", background: s.bg, color: s.color,
        border: `1px solid ${s.border}`,
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, background: s.dot }} />
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-10" style={{ padding: "30px 16px" }}>

        {/* Row 1 — Title */}
        <h1 className="text-3xl text-[#701366] font-Inter font-semibold" style={{ marginBottom: "15px" }}>
          Classes
        </h1>

        {/* Row 2 — Tabs + Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1 bg-[#f8e0f8] p-1 rounded-xl">
            {teacherTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => navigate(tab.path, { state: { teacher } })}
                style={{
                  padding: "6px 18px", borderRadius: "10px",
                  fontSize: "13px", fontFamily: "Inter, sans-serif",
                  fontWeight: "500", cursor: "pointer", border: "none",
                  transition: "all 0.2s",
                  background: location.pathname === tab.path ? "#701366" : "transparent",
                  color:      location.pathname === tab.path ? "#fff"    : "#701366",
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/Teachers")}
            style={{
              padding: "8px 20px", borderRadius: "8px",
              border: "1.5px solid #e2d0e2", background: "#fff",
              color: "#701366", fontSize: "13px",
              fontFamily: "Inter, sans-serif", cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
          >
            Back
          </button>
        </div>

        {/* Row 3 — Table */}
        <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                <th className="py-3 text-sm" style={{ paddingLeft: "24px" }}>Group</th>
                {/* <th className="px-4 py-3 text-sm">Language</th> */}
                <th className="px-4 py-3 text-sm">Level</th>
                <th className="px-4 py-3 text-sm">Start Date</th>
                <th className="px-4 py-3 text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8e0f8]">

              {loading && (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-[#701366] opacity-60">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading classes…</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-red-500 text-sm">{error}</td>
                </tr>
              )}

              {!loading && !error && classes.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[#701366] opacity-50 text-sm">
                    No classes found for this teacher.
                  </td>
                </tr>
              )}

              {!loading && !error && classes.map((row) => {
                const status = (row.status ?? "").toLowerCase();
                return (
                  <tr key={row.id} className="hover:bg-[#fffafe] transition-colors duration-100 h-12">
                    <td className="py-3 text-[#701366]" style={{ paddingLeft: "24px" }}>{row.name}</td>
                    {/* <td className="px-4 py-3 text-[#701366]">{row.language?.language_name ?? "—"}</td> */}
                    <td className="px-4 py-3 text-[#701366]">{row.level?.level_name ?? "—"}</td>
                    <td className="px-4 py-3 text-[#701366]">{row.start_date ?? "—"}</td>
                    <td className="px-4 py-3">{statusBadge(status)}</td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}