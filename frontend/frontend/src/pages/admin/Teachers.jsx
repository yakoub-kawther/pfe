import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { SquarePen, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Searchbar from "../../components/Searchbar";

const teachersData = [
  {
    id: 1,
    name: "Benahmed Ahmed",
    email: "benahmed@gmail.com",
    phone: "0669907507",
    language: "English",
    status: "Active",
    gender: "Male",
    dob: "",
    address: "",
    username: "benahmed",
    head_teacher: true,
  },
  {
    id: 2,
    name: "Benali Ali",
    email: "benali@gmail.com",
    phone: "0555163466",
    language: "French",
    status: "Inactive",
    gender: "Male",
    dob: "",
    address: "",
    username: "benali",
    head_teacher: false,
  },
];

const statusStyles = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-red-100 text-red-700",
};

const Teachers = () => {
  const navigate = useNavigate();
  const [teachers] = useState(teachersData);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    const headTeacherMatch =
      (q === "yes" && t.head_teacher === true) ||
      (q === "no"  && t.head_teacher === false);
    const matchSearch =
      t.name.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.language.toLowerCase().includes(q) ||
      headTeacherMatch;
    const matchFilter = filter === "All" || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-10 pt-6">

        {/* Header */}
        <section className="flex items-center gap-4 h-10" style={{ marginTop: "30px" }}>
          <h1 className="text-2xl text-[#701366] text-left whitespace-nowrap">Teachers List</h1>
          <Searchbar
            placeholder=" Name,phone,Head Teacher..."
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#701366] opacity-50 text-sm">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                filtered.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-[#fffafe] transition-colors duration-100 h-12">
                    <td className="py-3 text-[#701366]" style={{ paddingLeft: "20px" }}>{teacher.name}</td>
                    <td className="px-2 py-3 text-[#701366]">{teacher.email}</td>
                    <td className="px-4 py-3 text-[#701366]">{teacher.phone}</td>
                    <td className="px-4 py-3 text-[#701366]">{teacher.language}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-Inter ${
                          teacher.head_teacher
                            ? "bg-[#f8e0f8] text-[#701366]"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {teacher.head_teacher ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs ${statusStyles[teacher.status] || "bg-gray-100 text-gray-600"}`}>
                        {teacher.status || "—"}
                      </span>
                    </td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Teachers;