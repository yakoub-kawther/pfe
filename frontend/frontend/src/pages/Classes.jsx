import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Tabs from "../components/Tabs";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import Searchbar from "../components/Searchbar";

export default function Classes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const classTabs = [
    { name: "Classes", path: "/Classes" },
    { name: "Classrooms", path: "/Classrooms" },
  ];

  const classesData = [
    {
      name: "Class A",
      language: "English",
      level: "B2",
      teacher: "Mr Ahmed",
      students: 15,
      year: "2024-2025",
      status: { text: "Inactive", color: "red" },
    },
    {
      name: "Class B",
      language: "French",
      level: "C1",
      teacher: "Mme Sara",
      students: 20,
      year: "2025-2026",
      status: { text: "Active", color: "green" },
    },
  ];

  const statusStyles = {
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };

  const filteredClasses = classesData.filter((cls) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      cls.name.toLowerCase().includes(q) ||
      cls.language.toLowerCase().includes(q) ||
      cls.teacher.toLowerCase().includes(q) ||
      cls.level.toLowerCase().includes(q) ||
      cls.year.toLowerCase().includes(q);

    const matchesFilter =
      filter === "All" || cls.status.text === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-6 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mt-6">
          <h1 className="text-2xl text-[#701366]">Classes</h1>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between mt-6" >
          <Tabs tabs={classTabs} />
          <div className="flex items-center gap-3">
            <Searchbar
              placeholder="Search by name,language,teacher.."
              filterOptions={["Active", "Inactive"]}
              addPath="/Add_classes"
              showAdd={true}
              onSearchChange={(val) => setSearch(val)}
              onFilterChange={(val) => setFilter(val)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full px-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                <th className="py-3 pl-4" style={{ paddingLeft: "30px" }}>Name</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f8e0f8]">
              {filteredClasses.map((cls, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#fffafe] transition-colors duration-100 h-12"
                >
                  <td className="py-3 pl-4 text-[#701366] font-Inter" style={{ paddingLeft: "30px" }}>
                    {cls.name}
                  </td>
                  <td className="px-4 py-3 text-[#701366]">{cls.language}</td>
                  <td className="px-4 py-3 text-[#701366]">{cls.level}</td>
                  <td className="px-4 py-3 text-[#701366]">{cls.teacher}</td>
                  <td className="px-4 py-3 text-[#701366]">{cls.students}</td>
                  <td className="px-4 py-3 text-[#701366]">{cls.year}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[cls.status.color]}`}>
                      {cls.status.text}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                 <button
                   onClick={() => navigate("/Class_information", { state: { cls } })}
                   className="p-1.5 rounded-lg text-[#701366] hover:text-white hover:bg-[#701366] transition-all hover:scale-110"
                 >
                   <LayoutGrid className="w-4 h-4" />
                 </button>
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