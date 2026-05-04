import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import Searchbar from "../../components/Searchbar";
import { Loader2 } from "lucide-react";
import { apiFetch } from "../../services/api";

export default function Classrooms() {
  const classTabs = [
    { name: "Classes",    path: "/Classes"    },
    { name: "Classrooms", path: "/Classrooms" },
    { name: "Language",   path: "/Languages"  },
    { name: "Positions",   path: "/Positions"  },
  ];

  const [classrooms, setClassrooms] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("All");

  const buildParams = useCallback((searchVal, filterVal) => {
    const params = new URLSearchParams();
    if (searchVal.trim())                 params.set("search", searchVal.trim());
    if (filterVal && filterVal !== "All") params.set("status", filterVal);
    return params.toString();
  }, []);

  const fetchClassrooms = useCallback(async (searchVal, filterVal) => {
    setLoading(true);
    setError(null);
    try {
      const qs  = buildParams(searchVal, filterVal);
      const res = await apiFetch(`/academic/classrooms/${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setClassrooms(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) {
      setError(err.message || "Failed to load classrooms.");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    const timer = setTimeout(() => fetchClassrooms(search, filter), 300);
    return () => clearTimeout(timer);
  }, [search, filter, fetchClassrooms]);

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col gap-6 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pb-10">

        {/* Header */}
        <h2 className="text-2xl mt-6 text-[#701366]">Classrooms</h2>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between">
          <Tabs tabs={classTabs} />
          <Searchbar
            placeholder="Search by room or capacity..."
            filterOptions={["Available", "Occupied"]}
            addPath="/Add_classrooms"
            showAdd={true}
            onSearchChange={(val) => setSearch(val)}
            onFilterChange={(val) => setFilter(val)}
          />
        </div>

        {/* Table — smaller, centered */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ width: "100%" }}>
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                  <th className="py-3 px-8">Room</th>
                  <th className="py-3 px-8">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8e0f8]">

                {/* Loading */}
                {loading && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2 text-[#701366] opacity-60">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading classrooms...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Error */}
                {!loading && error && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-red-500 text-sm">
                      {error}
                    </td>
                  </tr>
                )}

                {/* Empty */}
                {!loading && !error && classrooms.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-8 text-center text-[#701366] opacity-50">
                      No classrooms found.
                    </td>
                  </tr>
                )}

                {/* Rows */}
                {!loading && !error && classrooms.map((room) => (
                  <tr key={room.id} className="hover:bg-[#fffafe] transition h-12">
                    <td className="py-3 px-8 text-[#701366]">
                      {room.name || room.room_number || `Room ${room.id}`}
                    </td>
                    <td className="py-3 px-8 text-[#701366]">{room.capacity ?? "---"}</td>
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