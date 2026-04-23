import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Tabs from "../../components/Tabs";

export default function Attendance_student() {
  const studentTabs = [
    { name: "Profile",    path: "/Student_profile" },
    { name: "Classes",    path: "/Student_classes" },
    { name: "Payment",    path: "/Payment_student" },
    { name: "Attendance", path: "/Attendance_student" },
  ];

  const attendanceData = [
    { date: "2026-04-10", subject: "English", status: { text: "Present", color: "green" } },
    { date: "2026-04-11", subject: "French",  status: { text: "Absent",  color: "red"   } },
    { date: "2026-04-12", subject: "Italian", status: { text: "Present", color: "green" } },
    { date: "2026-04-13", subject: "English", status: { text: "Absent",  color: "red"   } },
    { date: "2026-04-14", subject: "French",  status: { text: "Present", color: "green" } },
  ];

  const statusStyles = {
    green: "bg-green-100 text-green-600",
    red:   "bg-red-100 text-red-600",
  };

  const total   = attendanceData.length;
  const present = attendanceData.filter(a => a.status.text === "Present").length;
  const percent = Math.round((present / total) * 100);

  const radius       = 60;
  const stroke       = 12;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (percent / 100) * circumference;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        {/* TITLE */}
        <h2 className="text-2xl font-Inter text-[#701366]">Attendance</h2>

        {/* TABS */}
        <Tabs tabs={studentTabs} />

        {/* MAIN */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* TABLE — scrollable wrapper keeps design intact */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: "360px" }}>
                <thead>
                  <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                    <th style={{ paddingLeft: "30px" }} className="py-3 whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 whitespace-nowrap">Subject</th>
                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f8e0f8]">
                  {attendanceData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#fffafe] h-12">
                      <td style={{ paddingLeft: "30px" }} className="py-3 text-[#701366] whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="px-4 text-[#701366] whitespace-nowrap">
                        {item.subject}
                      </td>
                      <td className="px-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[item.status.color]}`}>
                          ● {item.status.text}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DONUT */}
          <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center">
            <h3 className="text-[#701366] mb-4 text-xl font-Inter">Attendance Rate</h3>

            <div className="flex gap-4 text-xs mb-4">
              <div className="flex items-center gap-1 text-[#fde68a]">
                <span className="w-2 h-2 bg-[#fde68a] rounded-full"></span>
                Absent
              </div>
              <div className="flex items-center gap-1 text-[#701366]">
                <span className="w-2 h-2 bg-[#701366] rounded-full"></span>
                Present
              </div>
            </div>

            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={radius} stroke="#fde68a" strokeWidth={stroke} fill="none" />
                <circle cx="75" cy="75" r={radius} stroke="#701366" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" transform="rotate(-90 75 75)" />
                <circle cx="75" cy="75" r={radius} stroke="#fde68a" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - ((100 - percent) / 100) * circumference}
                  strokeLinecap="round" transform={`rotate(${(percent / 100) * 360 - 90} 75 75)`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-Inter text-[#701366]">{percent}%</span>
                <span className="text-xs text-[#701366]">Present</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}