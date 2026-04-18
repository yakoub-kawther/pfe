import Navbar from "../components/Navbar";
import DashboardLayout from "../components/DashboardLayout";
import Searchbar from "../components/Searchbar";
import Tabs from "../components/Tabs";

const statusStyles = {
  "In Progress": "bg-[#F8E0F8] text-[#701366]",
  Completed: "bg-[#701366] text-white",
};

const studentTabs = [
  { name: "Profile", path: "/Student_profile" },
  { name: "Classes", path: "/Student_classes" },
  { name: "Payment", path: "/Payment_student" },
  { name: "Attendance", path: "/Attendance_student" },
];


const classesData = [
  {
    language: "Espagnol",
    level: "C1",
    oralScore: "60",
    writtenScore: "40",
    score: "50",
    status: "In Progress",
  },
  {
    language: "English",
    level: "C1",
    oralScore: "60",
    writtenScore: "40",
    score: "50",
    status: "Completed",
  },
];

export default function Studentclasses() {
  return (
    <DashboardLayout>
      <h2 className="text-2xl">Classes</h2>

      <div className="flex justify-between items-center mb-6">
        <Tabs tabs={studentTabs} />
        <Searchbar onAdd={false} />
      </div>

      <div className="p-6">
        <div className="max-w-6xl w-full px-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8E0F8] h-12.5 text-[#701366] font-Inter text-left">
                <th className="pr-4 py-3 text-sm font-Inter" style={{ paddingLeft: "30px" }}>Language</th>
                <th className="px-4 py-3 text-sm font-Inter">Level</th>
                <th className="px-4 py-3 text-sm font-Inter">Oral Test Score</th>
                <th className="px-4 py-3 text-sm font-Inter">Written Test Score</th>
                <th className="px-4 py-3 text-sm font-Inter">Score</th>
                <th className="px-4 py-3 text-sm font-Inter">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f8e0f8]">
              {classesData.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#fffafe] transition-colors duration-100 h-12"
                >
                  <td className="pr-4 py-3 text-[#701366] font-Inter" style={{ paddingLeft: "30px" }}>{row.language}</td>
                  <td className="px-4 py-3 text-[#701366]">{row.level}</td>
                  <td className="px-4 py-3 text-[#701366]">{row.oralScore}</td>
                  <td className="px-4 py-3 text-[#701366]">{row.writtenScore}</td>
                  <td className="px-4 py-3 text-[#701366]">{row.score}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[row.status]}`}
                    >
                       {row.status}
                    </span>
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