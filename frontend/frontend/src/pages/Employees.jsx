import { useNavigate } from "react-router-dom";
import { SquarePen, LayoutGrid } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const statusStyles = {
  Active: "bg-green-100 text-green-600",
  Inactive: "bg-red-100 text-red-600",
};

const employeesData = [
  {
    name: "test",
    phone: "055555555",
    position: "secreatire",
    hireDate: "15-05-2025",
    status: "Active",
  },
  {
    name: "test2",
    phone: "066666666",
    position: "cleaning lady",
    hireDate: "08-02-2025",
    status: "Inactive",
  },
  {
    name: "test3",
    phone: "077777777",
    position: "reception men",
    hireDate: "23-02-2026",
    status: "Active",
  },
];

export default function Employees() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-6 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginTop: "30px" }}>
          <h1 className="text-2xl text-[#701366]">Employees</h1>
         {/*<Searchbar onAdd={() => navigate("/Add_employee")} />*/ } 
        </div>

        {/* Table */}
        <div className="max-w-6xl w-full px-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                <th className="py-3 text-sm font-medium" style={{ paddingLeft: "30px" }}>Name</th>
                <th className="px-4 py-3 text-sm font-medium">Phone</th>
                <th className="px-4 py-3 text-sm font-medium">Position</th>
                <th className="px-4 py-3 text-sm font-medium">Hire Date</th>
                <th className="px-4 py-3 text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-sm font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f8e0f8]">
              {employeesData.map((emp, idx) => (
                <tr key={idx} className="hover:bg-[#fffafe] transition-colors duration-100 h-12">
                  <td className="py-3 text-[#701366] font-medium" style={{ paddingLeft: "30px" }}>{emp.name}</td>
                  <td className="px-4 py-3 text-[#701366]">{emp.phone}</td>
                  <td className="px-4 py-3 text-[#701366]">{emp.position}</td>
                  <td className="px-4 py-3 text-[#701366]">{emp.hireDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyles[emp.status]}`}>
                      ● {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        aria-label="Edit"
                        className="p-1.5 rounded-lg text-[#701366] hover:text-white hover:bg-[#701366] transition-all hover:scale-110"
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>
                      <button
                        aria-label="More"
                        onClick={() => navigate("/employee_profile")}
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

      </div>
    </DashboardLayout>
  );
}