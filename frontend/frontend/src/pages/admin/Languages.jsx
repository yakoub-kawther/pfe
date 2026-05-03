import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
// import { useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";
import { Loader2 } from "lucide-react";
import { apiFetch } from "../../services/api";

export default function Languages() {
  // const navigate = useNavigate();

  const [languages, setLanguages] = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const classTabs = [
    { name: "Classes",    path: "/Classes"    },
    { name: "Classrooms", path: "/Classrooms" },
    { name: "Language",   path: "/Languages"  },
  ];

  const fetchLanguages = useCallback(async (searchVal) => {
    setLoading(true);
    setError(null);
    try {
      const qs  = searchVal.trim() ? `?search=${encodeURIComponent(searchVal.trim())}` : "";
      const res = await apiFetch(`/academic/languages/${qs}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setLanguages(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err) {
      setError(err.message || "Failed to load languages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchLanguages(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchLanguages]);

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col gap-6 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pb-10">

        {/* Header */}
        <div className="flex items-center justify-between mt-6">
          <h1 className="text-xl sm:text-2xl text-[#701366]">Language</h1>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Tabs tabs={classTabs} />
          <div className="flex items-center gap-3">
            <Searchbar
              placeholder="Search by id, language, shortcut..."
              addPath="/Add_language"
              showAdd={true}
              onSearchChange={(val) => setSearch(val)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full min-w-100 text-sm">
            <thead>
              <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                <th className="py-3 whitespace-nowrap" style={{ paddingLeft: "50px" }}>ID</th>
                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Language</th>
                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Shortcut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8e0f8]">

              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan={3} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-[#701366] opacity-60">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading languages...</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Error */}
              {!loading && error && (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-red-500 text-sm">
                    {error}
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && !error && languages.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-[#701366] opacity-50">
                    No languages found.
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading && !error && languages.map((lang) => (
                <tr key={lang.id} className="hover:bg-[#fffafe] transition-colors duration-100 h-12">
                  <td className="py-3 text-[#701366] font-Inter whitespace-nowrap" style={{ paddingLeft: "50px" }}>
                    {lang.id}
                  </td>
                  <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">
                    {lang.language_name}
                  </td>
                  <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                    
                      {lang.shortcut}
                    
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}