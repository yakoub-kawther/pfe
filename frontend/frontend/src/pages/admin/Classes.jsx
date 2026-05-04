import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Loader2 } from "lucide-react";
import Searchbar from "../../components/Searchbar";
import { apiFetch } from "../../services/api";



// const thStyle = {
//   padding: "12px 16px",
//   fontSize: "14px",
//   fontWeight: 500,
//   textAlign: "left",
//   whiteSpace: "nowrap",
//   color: "#701366",
// };

// const tdStyle = {
//   padding: "12px 16px",
//   fontSize: "14px",
//   color: "#701366",
//   whiteSpace: "nowrap",
// };

// const statusStyles = {
//   green: { background: "#dcfce7", color: "#16a34a" },
//   red:   { background: "#fee2e2", color: "#ef4444" },
// };

export default function Classes() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("All");

  const classTabs = [
    { name: "Classes",    path: "/Classes"    },
    { name: "Classrooms", path: "/Classrooms" },
    { name: "Language",   path: "/Languages"  },
    { name: "Positions",   path: "/Positions"  },
  ];

  const buildParams = useCallback((searchVal, filterVal) => {
    const params = new URLSearchParams();
    if (searchVal.trim())                 params.set("search", searchVal.trim());
    if (filterVal && filterVal !== "All") params.set("status", filterVal);
    return params.toString();
  }, []);

  const fetchClasses = useCallback(async (searchVal, filterVal) => {
    setLoading(true);
    setError(null);
    try {
      const qs  = buildParams(searchVal, filterVal);
      const res = await apiFetch(`/academic/classes/${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) {
      setError(err.message || "Failed to load classes.");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    const timer = setTimeout(() => fetchClasses(search, filter), 300);
    return () => clearTimeout(timer);
  }, [search, filter, fetchClasses]);

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col gap-6 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pb-10">

        {/* Header */}
        <div className="flex items-center justify-between mt-6">
          <h2 className="text-xl sm:text-2xl text-[#701366]">Classes</h2>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Tabs tabs={classTabs} />
          <div className="flex items-center gap-3">
            <Searchbar
              placeholder="Search by name, language, teacher..."
              filterOptions={["Active", "Inactive"]}
              addPath="/Add_classe"
              showAdd={true}
              onSearchChange={(val) => setSearch(val)}
              onFilterChange={(val) => setFilter(val)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full min-w-160 text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                <th className="py-3 whitespace-nowrap" style={{ paddingLeft: "50px" }}>Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Language</th>
                <th className="px-4 py-3 whitespace-nowrap">Level</th>
                <th className="px-4 py-3 whitespace-nowrap">Teacher</th>
                <th className="px-4 py-3 whitespace-nowrap">Start Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8e0f8]">

              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-[#701366] opacity-60">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading classes...</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Error */}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-red-500 text-sm">
                    {error}
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && !error && classes.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-[#701366] opacity-50">
                    No classes found.
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading && !error && classes.map((cls) => {
                // const person   = cls.teacher?.employee?.person ?? {};
                const status   = (cls.status ?? "").toLowerCase();
                // const fullName = `${cls.teacher?.first_name ?? ""} ${cls.teacher?.last_name ?? ""}`.trim();

                return (
                  <tr
                    key={cls.id}
                    className="hover:bg-[#fffafe] transition-colors duration-100 h-12"
                  >
                    <td className="py-3 text-[#701366] whitespace-nowrap" style={{ paddingLeft: "50px" }}>
                      {cls.name || "---"}
                    </td>
                    <td className="px-4 py-3 text-[#701366] whitespace-nowrap">{cls.language?.language_name ?? "---"}</td>
                    <td className="px-4 py-3 text-[#701366] whitespace-nowrap">{cls.level?.level_name       ?? "---"}</td>
                    <td className="px-4 py-3 text-[#701366] whitespace-nowrap">{cls.teacher                || "---"}</td>
                    <td className="px-4 py-3 text-[#701366] whitespace-nowrap">{cls.start_date              || "---"}</td>

                    {/* Status badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 12px", borderRadius: "20px", fontSize: "11px",
                        fontWeight: "600", fontFamily: "Inter, sans-serif", letterSpacing: "0.03em",
                        background: status === "active" ? "#dcfce7" : "#fee2e2",
                        color:      status === "active" ? "#15803d"  : "#b91c1c",
                        border:     `1px solid ${status === "active" ? "#bbf7d0" : "#fecaca"}`,
                        whiteSpace: "nowrap",
                      }}>
                        <span style={{
                          width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                          background: status === "active" ? "#16a34a" : "#dc2626",
                        }} />
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "---"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => navigate("/Classe_information", { state: { cls } })}
                        style={{
                          padding: "6px", borderRadius: "4px", border: "none",
                          background: "none", color: "#701366", cursor: "pointer",
                          transition: "background 0.15s, color 0.15s, transform 0.15s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white";   e.currentTarget.style.transform = "scale(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none";    e.currentTarget.style.color = "#701366"; e.currentTarget.style.transform = "scale(1)";   }}
                      >
                        <LayoutGrid style={{ width: "16px", height: "16px" }} />
                      </button>
                    </td>
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