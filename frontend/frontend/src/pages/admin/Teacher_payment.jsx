import DashboardLayout from "../../components/DashboardLayout";
import Tabs from "../../components/Tabs";
import { useLocation } from "react-router-dom";

const statusStyles = {
  green: "bg-green-100 text-green-600",
  yellow:   "bg-yellow-100 text-yellow-600",
};

const paymentData = [
  { month: "January",  amount: "15,000 DA", classes: 2, status: { text: "Paid",   color: "green" } },
  { month: "February", amount: "25,000 DA", classes: 4, status: { text: "Paid",   color: "green" } },
  { month: "March",    amount: "35,000 DA", classes: 5, status: { text: "Pending", color: "yellow"   } },
  { month: "April",    amount: "45,000 DA", classes: 6, status: { text: "Pending", color: "yellow"   } },
];

export default function Payment_teacher() {
  const { state } = useLocation();
  const teacher = state?.teacher;

  const teacherTabs = [
    { name: "Profile", path: "/Teacher_profile", state: { teacher } },
    { name: "Classes", path: "/Teacher_classes", state: { teacher } },
    { name: "Payment", path: "/Teacher_payment", state: { teacher } },
  ];

  const total       = paymentData.length;
  const paid        = paymentData.filter((p) => p.status.text === "Paid").length;
  const percent     = Math.round((paid / total) * 100);
  const radius      = 60;
  const stroke      = 12;
  const circumference = 2 * Math.PI * radius;
  const offset      = circumference - (percent / 100) * circumference;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        <h2 className="text-2xl text-[#701366]">Payments</h2>

        <Tabs tabs={teacherTabs} />

        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT — TABLE */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                  <th className="py-3 text-sm" style={{ paddingLeft: "30px" }}>Month</th>
                  <th className="px-4 py-3 text-sm">Amount</th>
                  <th className="px-4 py-3 text-sm">Classes</th>
                  <th className="px-4 py-3 text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8e0f8]">
                {paymentData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fffafe] transition-colors h-12">
                    <td className="py-3 text-[#701366]" style={{ paddingLeft: "30px" }}>{item.month}</td>
                    <td className="px-4 py-3 text-[#701366]">{item.amount}</td>
                    <td className="px-4 py-3 text-[#701366]">{item.classes}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusStyles[item.status.color]}`}>
                        ● {item.status.text}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT — DONUT */}
          <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center">

            <h3 className="text-[#701366] text-xl mb-4">Payment Rate</h3>

            <div className="flex gap-4 text-xs mb-4">
              <div className="flex items-center gap-1 text-[#fde68a]">
                <span className="w-2 h-2 bg-[#fde68a] rounded-full"></span>
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
                <circle
                  cx="75" cy="75" r={radius}
                  stroke="#701366" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" transform="rotate(-90 75 75)"
                />
                <circle
                  cx="75" cy="75" r={radius}
                  stroke="#fde68a" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - ((100 - percent) / 100) * circumference}
                  strokeLinecap="round"
                  transform={`rotate(${(percent / 100) * 360 - 90} 75 75)`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl text-[#701366]">{percent}%</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}