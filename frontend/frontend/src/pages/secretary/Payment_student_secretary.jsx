import React from "react";
import Secretary_layout from "../../layouts/Secretary_layout";
import Tabs from "../../components/Tabs";

export default function Payment_student() {
  const studentTabs = [
    { name: "Profile",    path: "/Student_profile_secretary" },
    { name: "Classes",    path: "/Student_classes_secretary" },
    { name: "Payment",    path: "/Payment_student_secretary" },
    { name: "Attendance", path: "/Attendance_student_secretary" },
  ];

  const paymentData = [
    { language: "English", level: "C1", absences: 60, status: { text: "Paid",   color: "green" } },
    { language: "English", level: "C1", absences: 60, status: { text: "Unpaid", color: "red"   } },
    { language: "English", level: "C1", absences: 60, status: { text: "Paid",   color: "green" } },
    { language: "English", level: "C1", absences: 60, status: { text: "Unpaid", color: "red"   } },
  ];

  const statusStyles = {
    green: "bg-green-100 text-green-600",
    red:   "bg-red-100 text-red-600",
  };

  const total  = paymentData.length;
  const paid   = paymentData.filter((p) => p.status.text === "Paid").length;
  const percent = Math.round((paid / total) * 100);

  const radius       = 60;
  const stroke       = 12;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (percent / 100) * circumference;

  return (
    <Secretary_layout>
      <div className="flex flex-col gap-6">

        {/* TITLE */}
        <h2 className="text-2xl font-Inter text-[#701366]">All Payments</h2>

        {/* TABS */}
        <Tabs tabs={studentTabs} />

        {/* MAIN CONTENT */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* TABLE */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: "360px" }}>
                <thead>
                  <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                    <th className="pr-4 py-3 whitespace-nowrap" style={{ paddingLeft: "30px" }}>Language</th>
                    <th className="px-4 py-3 whitespace-nowrap">Level</th>
                    <th className="px-4 py-3 whitespace-nowrap">Absences</th>
                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f8e0f8]">
                  {paymentData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#fffafe] transition-colors h-12">
                      <td className="pr-4 py-3 text-[#701366] whitespace-nowrap" style={{ paddingLeft: "30px" }}>
                        {item.language}
                      </td>
                      <td className="px-4 py-3 text-[#701366] whitespace-nowrap">{item.level}</td>
                      <td className="px-4 py-3 text-green-600 whitespace-nowrap">{item.absences}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-Inter ${statusStyles[item.status.color]}`}>
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
            <h3 className="text-[#701366] font-Inter text-xl mb-4">Payments Rate</h3>

            <div className="flex gap-4 text-xs mb-4">
              <div className="flex items-center gap-1 text-[#f2c94c]">
                <span className="w-2 h-2 bg-[#f2c94c] rounded-full"></span>
                Unpaid
              </div>
              <div className="flex items-center gap-1 text-[#701366]">
                <span className="w-2 h-2 bg-[#701366] rounded-full"></span>
                Paid
              </div>
            </div>

            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={radius} stroke="#eee" strokeWidth={stroke} fill="none" />
                <circle cx="75" cy="75" r={radius} stroke="#701366" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" transform="rotate(-90 75 75)" />
                <circle cx="75" cy="75" r={radius} stroke="#fde68a" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - ((100 - percent) / 100) * circumference}
                  strokeLinecap="round" transform={`rotate(${(percent / 100) * 360 - 90} 75 75)`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-Inter text-[#701366]">{percent}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Secretary_layout>
  );
}