import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { SquarePen, LayoutGrid, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";

const API_BASE = "http://localhost:8000/api";

// keys match the raw lowercase values from the API: "active" / "inactive"
// const statusStyles = {
//   active:   "bg-green-100 text-green-700",
//   inactive: "bg-red-100 text-red-700",
// };

const Teachers = () => {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");

  const buildParams = useCallback((searchVal, filterVal) => {
    const params = new URLSearchParams();

    if (searchVal.trim()) {
      const q = searchVal.trim().toLowerCase();
      if (q === "yes") {
        params.set("is_head_teacher", "true");
      } else if (q === "no") {
        params.set("is_head_teacher", "false");
      } else {
        params.set("search", searchVal.trim());
      }
    }

    if (filterVal && filterVal !== "All") {
      // must match the param name read in Django: request.query_params.get('employee__status')
      params.set("employee__status", filterVal.toLowerCase());
    }

    return params.toString();
  }, []);

  const fetchTeachers = useCallback(async (searchVal, filterVal) => {
  setLoading(true);
  setError(null);
  try {
    const qs  = buildParams(searchVal, filterVal);
    const url = `${API_BASE}/persons/teachers/${qs ? `?${qs}` : ""}`;

    const res = await fetch(url); // ✅ no Content-Type header

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();
    setTeachers(Array.isArray(data) ? data : (data.results ?? []));
  } catch (err) {
    setError(err.message || "Failed to load teachers.");
  } finally {
    setLoading(false);
  }
}, [buildParams]);

// ✅ single useEffect only
useEffect(() => {
  const timer = setTimeout(() => fetchTeachers(search, filter), 300);
  return () => clearTimeout(timer);
}, [search, filter, fetchTeachers]);
  
  


  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-10 pt-6">

        {/* Header */}
        <section className="flex items-center gap-4 h-10" style={{ marginTop: "30px" }}>
          <h1 className="text-2xl text-[#701366] text-left whitespace-nowrap">
            Teachers List
          </h1>
          <Searchbar
            placeholder=" Name, phone, Head Teacher..."
            filterOptions={["Active", "Inactive"]}
            addPath="/Add_teacher"
            showAdd={true}
            onSearchChange={(val) => setSearch(val)}
            onFilterChange={(val) => setFilter(val)}
          />
        </section>

        {/* Table */}
        <div className="max-w-6xl w-full px-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                <th className="py-3 text-sm" style={{ paddingLeft: "20px" }}>Name</th>
                <th className="px-2 py-3 text-sm">Email</th>
                <th className="px-4 py-3 text-sm">Phone</th>
                <th className="px-4 py-3 text-sm">Language</th>
                <th className="px-4 py-3 text-sm">Head Teacher</th>
                <th className="px-4 py-3 text-sm">Status</th>
                <th className="px-4 py-3 text-sm">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f8e0f8]">

              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-[#701366] opacity-60">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading teachers...</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Error */}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-red-500 text-sm">
                    {error}
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && !error && teachers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#701366] opacity-50 text-sm">
                    No teachers found.
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading && !error && teachers.map((teacher) => {
                const person   = teacher.employee?.person ?? {};
                const employee = teacher.employee         ?? {};
                const fullName = `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();

                // raw value from API is lowercase: "active" or "inactive"
                const status = (employee.status ?? "").toLowerCase();

                return (
                  <tr
                    key={employee.person_id}
                    className="hover:bg-[#fffafe] transition-colors duration-100 h-12"
                  >
                    <td className="py-3 text-[#701366]" style={{ paddingLeft: "20px" }}>
                      {fullName || "---"}
                    </td>
                    <td className="px-2 py-3 text-[#701366]">{person.email  || "---"}</td>
                    <td className="px-4 py-3 text-[#701366]">{person.phone  || "---"}</td>
                    <td className="px-4 py-3 text-[#701366]">{teacher.language ?.language_name?? "---"}</td>

                    {/* Head Teacher badge */}
                    <td className="px-4 py-3">
  <span style={{
    display      : "inline-flex",
    alignItems   : "center",
    gap          : "5px",
    padding      : "4px 12px",
    borderRadius : "20px",
    fontSize     : "11px",
    fontWeight   : "600",
    fontFamily   : "Inter, sans-serif",
    letterSpacing: "0.03em",
    background   : teacher.is_head_teacher ? "#f8e0f8" : "#f3f4f6",
    color        : teacher.is_head_teacher ? "#701366"  : "#6b7280",
    border       : `1px solid ${teacher.is_head_teacher ? "#e9b8e9" : "#e5e7eb"}`,
  }}>
    <span style={{
      width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
      background: teacher.is_head_teacher ? "#701366" : "#9ca3af",
    }} />
    {teacher.is_head_teacher ? "Yes" : "No"}
  </span>
</td>

                    {/* Status badge - lookup uses lowercase key */}
                    <td className="px-4 py-3">
  <span style={{
    display      : "inline-flex",
    alignItems   : "center",
    gap          : "5px",
    padding      : "4px 12px",
    borderRadius : "20px",
    fontSize     : "11px",
    fontWeight   : "600",
    fontFamily   : "Inter, sans-serif",
    letterSpacing: "0.03em",
    background   : status === "active" ? "#dcfce7" : "#fee2e2",
    color        : status === "active" ? "#15803d"  : "#b91c1c",
    border       : `1px solid ${status === "active" ? "#bbf7d0" : "#fecaca"}`,
  }}>
    <span style={{
      width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
      background: status === "active" ? "#16a34a" : "#dc2626",
    }} />
    {status ? status.charAt(0).toUpperCase() + status.slice(1) : "---"}
  </span>
</td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label="Edit"
                          onClick={() => navigate("/Edit_teacher", { state: { teacher } })}
                          className="p-1.5 rounded-xs text-[#701366] hover:text-white hover:bg-[#701366] transition-all hover:scale-110"
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                        <button
                          aria-label="More"
                          onClick={() => navigate("/Teacher_profile", { state: { teacher } })}
                          className="p-1.5 rounded-xs text-[#701366] hover:text-white hover:bg-[#701366] transition-all hover:scale-110"
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                      </div>
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
};

export default Teachers;