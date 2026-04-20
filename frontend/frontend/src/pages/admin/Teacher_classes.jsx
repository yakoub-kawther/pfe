import DashboardLayout from "../../components/DashboardLayout";
import Tabs from "../../components/Tabs";
import { useLocation } from "react-router-dom";

const statusStyles = {
  "In Progress": "bg-[#F8E0F8] text-[#701366]",
  Completed: "bg-[#701366] text-white",
};

const classesData = [
  { language: "English", level: "B2", group: "Group A", schedule: "Mon / Wed", students: 12, status: "In Progress" },
  { language: "French",  level: "A1", group: "Group B", schedule: "Tue / Thu", students: 10, status: "Completed"   },
  { language: "Arabic",  level: "C1", group: "Group C", schedule: "Sat",       students: 8,  status: "In Progress" },
];

export default function Classes_teacher() {
  const { state } = useLocation();
  const teacher = state?.teacher;

  const teacherTabs = [
    { name: "Profile", path: "/Teacher_profile", state: { teacher } },
    { name: "Classes", path: "/Teacher_classes", state: { teacher } },
    { name: "Payment", path: "/Teacher_payment", state: { teacher } },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        <h2 className="text-2xl text-[#701366]">Classes</h2>

        <Tabs tabs={teacherTabs} />

        <div className="max-w-6xl w-full px-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                <th className="py-3 text-sm" style={{ paddingLeft: "30px" }}>Language</th>
                <th className="px-4 py-3 text-sm">Level</th>
                <th className="px-4 py-3 text-sm">Group</th>
                <th className="px-4 py-3 text-sm">Schedule</th>
                <th className="px-4 py-3 text-sm">Students</th>
                <th className="px-4 py-3 text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8e0f8]">
              {classesData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#fffafe] transition-colors duration-100 h-12">
                  <td className="py-3 text-[#701366]" style={{ paddingLeft: "30px" }}>{row.language}</td>
                  <td className="px-4 py-3 text-[#701366]">{row.level}</td>
                  <td className="px-4 py-3 text-[#701366]">{row.group}</td>
                  <td className="px-4 py-3 text-[#701366]">{row.schedule}</td>
                  <td className="px-4 py-3 text-[#701366]">{row.students}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[row.status]}`}>
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