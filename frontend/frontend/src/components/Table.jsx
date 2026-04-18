import React from "react";
import { useNavigate } from "react-router-dom";
import { SquarePen, LayoutGrid } from "lucide-react";

const studentsData = [
  {
    name: "Yousra zt",
    contact: "0669905547",
    parent: "abdou zt",
    status: { text: "Active", color: "green" },
    attendance: "100%",
    languages: 3,
  },
  {
    name: "Liam Smith",
    contact: "05555555",
    parent: "john smith",
    status: { text: "Graduated", color: "yellow" },
    attendance: "20%",
    languages: 2,
  },
  {
    name: "Emma Brown",
    contact: "07777777",
    parent: "brown family",
    status: { text: "Inactive", color: "red" },
    attendance: "70%",
    languages: 4,
  },
  {
    name: "Noah Martin",
    contact: "06612345",
    parent: "martin family",
    status: { text: "Active", color: "green" },
    attendance: "40%",
    languages: 3,
  },
  {
    name: "Olivia Davis",
    contact: "06789123",
    parent: "davis family",
    status: { text: "Graduated", color: "yellow" },
    attendance: "20%",
    languages: 5,
  },
  {
    name: "James Lee",
    contact: "06123456",
    parent: "lee family",
    status: { text: "Inactive", color: "red" },
    attendance: "70%",
    languages: 2,
  },
  {
    name: "Ava Johnson",
    contact: "06987654",
    parent: "johnson family",
    status: { text: "Active", color: "green" },
    attendance: "40%",
    languages: 3,
  },
];

const statusStyles = {
  green: "bg-green-100 text-green-600",
  yellow: "bg-yellow-100 text-yellow-600",
  red: "bg-red-100 text-red-600",
};

const Table = ({ search = "", filter = "All" }) => {
  const navigate = useNavigate();

  const filteredStudents = studentsData.filter((student) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      student.name.toLowerCase().includes(q) ||
      student.contact.toLowerCase().includes(q);

    const matchesFilter =
      filter === "All" || student.status.text === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl w-full px-6 bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm" id="studentsTable">
        <thead>
          <tr className="bg-[#F8E0F8] h-12.5 text-[#701366] font-Inter text-left">
            <th className="pr-4 py-3 text-sm font-Inter" style={{ paddingLeft: "30px" }}>Name</th>
            <th className="px-4 py-3 text-sm font-Inter">Contact</th>
            <th className="px-4 py-3 text-sm font-Inter">Parent Name</th>
            <th className="px-4 py-3 text-sm font-Inter">Statut</th>
            <th className="px-4 py-3 text-sm font-Inter">Attendance</th>
            <th className="px-4 py-3 text-sm font-Inter">Languages</th>
            <th className="px-4 py-3 text-sm font-Inter">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#f8e0f8]">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, idx) => (
              <tr
                key={idx}
                className="hover:bg-[#fffafe] font-Inter transition-colors h-12.5 duration-100 student-row"
              >
                <td className="pr-4 py-3 font-Inter text-[#701366]" style={{ paddingLeft: "30px" }}>
                  {student.name}
                </td>
                <td className="px-4 py-3 text-[#701366]">{student.contact}</td>
                <td className="px-4 py-3 text-[#701366]">{student.parent}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyles[student.status.color]}`}>
                    ● {student.status.text}
                  </span>
                </td>
                <td className={`px-4 py-3 font-Inter ${
                  student.status.color === "green" ? "text-green-600" :
                  student.status.color === "red" ? "text-red-500" : "text-yellow-500"
                }`}>
                  {student.attendance}
                </td>
                <td className="px-4 py-3 text-[#701366]">{student.languages}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
<button
  aria-label="Edit"
  onClick={() => navigate("/Edit_student", { state: { student } })}
  className="p-1.5 rounded-lg text-[#701366] hover:text-white hover:bg-[#701366] transition-all hover:scale-110"
>
  <SquarePen className="w-4 h-4" />
</button>
                    <button
                      aria-label="More"
                      onClick={() => navigate("/Student_profile")}
                      className="p-1.5 rounded-lg text-[#701366] hover:text-white hover:bg-[#701366] transition-all hover:scale-110"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-8 text-[#701366] opacity-50">
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;