import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { SquarePen, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 🔹 Data
const teachersData = [
  {
    name: "Benahmed Ahmed",
    email: "benahmed@gmail.com",
    phone: "0669907507",
    language: "English",
    status: "Active",
  },
  {
    name: "Benali ALi",
    email: "benali@gmail.com",
    phone: "0555163466",
    language: "French",
    status: "Inactive",
  },
];

//  Status styles
const statusStyles = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-red-100 text-red-700",
};

const Teachers = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-Inter">All Teachers list</h1>
        {/* {<Searchbar onAdd={() => navigate("/Add_teacher")} /> } */}

      </div>

      {/* Table */}
      <div className="max-w-6xl w-full px-6 bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8E0F8] h-12.5 text-[#701366] font-Inter text-left">
              <th className=" py-3 text-sm font-Inter" style={{ paddingLeft: "20px" }}>Name</th>
              <th className="px-2 py-3 text-sm font-Inter">Email</th>
              <th className="px-4 py-3 text-sm font-Inter">Phone</th>
              <th className="px-4 py-3 text-sm font-Inter">Language</th>
              <th className="px-4 py-3 text-sm font-Inter">Status</th>
              <th className="px-4 py-3 text-sm font-Inter">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f8e0f8]">
            {teachersData.map((teacher, idx) => (
              <tr
                key={idx}
                className="hover:bg-[#fffafe] font-Inter transition-colors duration-100 h-12"
              >
                <td className=" py-3 text-[#701366] font-Inter" style={{ paddingLeft: "20px" }}>
                  {teacher.name}
                </td>
                <td className="px-2 py-3  text-[#701366] font-Inter">
                  {teacher.email}
                </td>
                <td className="px-4 py-3 text-[#701366] font-Inter">
                  {teacher.phone}
                </td>
                <td className="px-4 py-3 text-[#701366] font-Inter">
                  {teacher.language}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-Inter ${statusStyles[teacher.status]}`}
                  >
                    {teacher.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* Edit */}
                    <button
                      aria-label="Edit"
                      className="p-1.5 rounded-lg text-[#701366] hover:text-white hover:bg-[#701366] transition-all hover:scale-110"
                    >
                      <SquarePen className="w-4 h-4"/>
                    </button>

                    {/* More info */}
                    <button
                      aria-label="More"
                      onClick={() => navigate("/Teacher_profile")}
                      className="p-1.5 rounded-lg text-[#701366] hover:text-white hover:bg-[#701366] transition-all hover:scale-110"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Teachers;