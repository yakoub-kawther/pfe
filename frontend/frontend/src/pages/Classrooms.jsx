import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Tabs from "../components/Tabs";
import { useNavigate } from "react-router-dom";
import Searchbar from "../components/Searchbar";

export default function Classes() {
  const navigate = useNavigate();

  const classTabs = [
    { name: "Classes", path: "/Classes" },
    { name: "Classrooms", path: "/Classrooms" },
  ];

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const classesData = [
    {
      id: "1",
      capacity: 15,
      status: { text: "Available", color: "green" },
    },
    {
      id: "2",
      capacity: 20,
      status: { text: "Occupied", color: "red" },
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
      cls.id.toLowerCase().includes(q) ||
      cls.capacity.toString().includes(q) ||
      cls.status.text.toLowerCase().includes(q);

    const matchesFilter =
      filter === "All" || cls.status.text === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <h2 className="text-2xl mb-4 text-[#701366] font-Inter">
        Classes
      </h2>

      <div className="flex items-center gap-4 my-4 ">
        {/* Tabs (left) */}
        <Tabs tabs={classTabs} />

        {/*  Searchbar with built-in Add button */}
        <Searchbar
          placeholder="Search by ID or status..."
          onSearchChange={(val) => setSearch(val)}        
          onFilterChange={(val) => setFilter(val)}
          filterOptions={["Available", "Occupied"]}
          addPath="/Add-Classrooms"                        
          showAdd={true}
        />
      </div>

      {/* Table */}
      <div className="w-full px-6 bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
              <th className="py-3 pl-8 text-center">ID</th>
              <th className="px-4 py-3 text-center">Capacity</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f8e0f8]">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls) => (
                <tr
                  key={cls.id}
                  className="hover:bg-[#fffafe] transition h-12"
                >
                  <td className="py-3 pl-8 text-center text-[#701366]">
                    {cls.id}
                  </td>
                  <td className="px-4 py-3 text-center text-[#701366]">
                    {cls.capacity}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-medium ${statusStyles[cls.status.color]}`}
                    >
                      {cls.status.text}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-8 text-center text-[#701366] opacity-50">
                  No classes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}