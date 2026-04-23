import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Tabs from "../../components/Tabs";
import Searchbar from "../../components/Searchbar";

export default function Classrooms() {
  const classTabs = [
    { name: "Classes",    path: "/Classes"    },
    { name: "Classrooms", path: "/Classrooms" },
        { name: "Language",   path: "/Languages"  },
  ];

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const classroomsData = [
    { id: "Room 1", capacity: 15, status: { text: "Available", color: "green" } },
    { id: "Room 2", capacity: 20, status: { text: "Occupied",  color: "red"   } },
    { id: "Room 3", capacity: 18, status: { text: "Available", color: "green" } },
  ];

  const statusStyles = {
    green: "bg-green-100 text-green-600",
    red:   "bg-red-100 text-red-600",
  };

  const filtered = classroomsData.filter((cls) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      cls.id.toLowerCase().includes(q) ||
      cls.capacity.toString().includes(q) ||
      cls.status.text.toLowerCase().includes(q);
    const matchFilter = filter === "All" || cls.status.text === filter;
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>
      {/* Only change: was max-w-6xl mx-auto, now w-full with fluid padding */}
      <div className="w-full flex flex-col gap-6" style={{ padding: "24px 16px 40px" }}>

        <h2 className="text-2xl mt-6 text-[#701366]">Classrooms</h2>

        <div className="flex items-center justify-between">
          <Tabs tabs={classTabs} />
          <Searchbar
            placeholder="Search by ID or status..."
            filterOptions={["Available", "Occupied"]}
            addPath="/Add-Classrooms"
            showAdd={true}
            onSearchChange={(val) => setSearch(val)}
            onFilterChange={(val) => setFilter(val)}
          />
        </div>

        <div className="w-full px-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                <th className="py-3" style={{ paddingLeft: "50px" }}>ID</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8e0f8]">
              {filtered.length > 0 ? (
                filtered.map((cls) => (
                  <tr key={cls.id} className="hover:bg-[#fffafe] transition h-12">
                    <td className="py-3 text-[#701366]" style={{ paddingLeft: "50px" }}>{cls.id}</td>
                    <td className="px-4 py-3 text-[#701366]">{cls.capacity}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-medium ${statusStyles[cls.status.color]}`}>
                        {cls.status.text}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[#701366] opacity-50">
                    No classrooms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}