import React, { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import Searchbar from "../../components/Searchbar";

export default function Classes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const classTabs = [
    { name: "Classes",    path: "/Classes"    },
    { name: "Classrooms", path: "/Classrooms" },
    { name: "Language",   path: "/Languages"  },
  ];

  const classesData = [
    {
      name: "Class A", language: "English", level: "B2", teacher: "Mr Ahmed",
      students: 15, year: "2024-2025", status: { text: "Inactive", color: "red" },
    },
    {
      name: "Class B", language: "French", level: "C1", teacher: "Mme Sara",
      students: 20, year: "2025-2026", status: { text: "Active", color: "green" },
    },
  ];

  const statusStyles = {
    green: "bg-green-100 text-green-600",
    red:   "bg-red-100 text-red-600",
  };

  const filteredClasses = classesData.filter((cls) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      cls.name.toLowerCase().includes(q)     ||
      cls.language.toLowerCase().includes(q) ||
      cls.teacher.toLowerCase().includes(q)  ||
      cls.level.toLowerCase().includes(q)    ||
      cls.year.toLowerCase().includes(q);
    const matchesFilter = filter === "All" || cls.status.text === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col gap-6 pt-6 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 pb-10">

        {/* Header */}
        <div className="flex items-center justify-between mt-6">
          <h1 className="text-xl sm:text-2xl text-[#701366]">Classes</h1>
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
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                <th className="py-3 pl-6 lg:pl-8 whitespace-nowrap" style={{ paddingLeft: "50px" }}>Name</th>
                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Language</th>
                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Level</th>
                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Teacher</th>
                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Students</th>
                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Year</th>
                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-3 lg:px-4 py-3 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8e0f8]">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-[#701366] opacity-50">
                    No classes found.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#fffafe] transition-colors duration-100 h-12"
                  >
                    <td className="py-3 pl-6 lg:pl-8 text-[#701366] font-Inter whitespace-nowrap" style={{ paddingLeft: "50px" }}>{cls.name}</td>
                    <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">{cls.language}</td>
                    <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">{cls.level}</td>
                    <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">{cls.teacher}</td>
                    <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">{cls.students}</td>
                    <td className="px-3 lg:px-4 py-3 text-[#701366] whitespace-nowrap">{cls.year}</td>
                    <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-Inter ${statusStyles[cls.status.color]}`}
                      >
                        {cls.status.text}
                      </span>
                    </td>
                    <td className="px-3 lg:px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => navigate("/Classes_information", { state: { cls } })}
                        className="p-1.5 rounded-sm text-[#701366] hover:text-white hover:bg-[#701366] transition-all hover:scale-110"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}