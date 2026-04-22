import DashboardLayout from "../../components/DashboardLayout";
import { useLocation, useNavigate } from "react-router-dom";

const paymentData = [
  { month: "January",  amount: "15,000 DA", classes: 2, status: "paid"    },
  { month: "February", amount: "25,000 DA", classes: 4, status: "paid"    },
  { month: "March",    amount: "35,000 DA", classes: 5, status: "pending" },
  { month: "April",    amount: "45,000 DA", classes: 6, status: "pending" },
];

const statusBadge = (status) => {
  const cfg = {
    paid:    { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0", dot: "#16a34a" },
    pending: { bg: "#fef9c3", color: "#854d0e", border: "#fde68a", dot: "#ca8a04" },
  };
  const s = cfg[status] ?? { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb", dot: "#9ca3af" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 12px", borderRadius: "20px", fontSize: "11px",
      fontWeight: "600", fontFamily: "Inter, sans-serif",
      letterSpacing: "0.03em", background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0, background: s.dot }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function Payment_teacher() {
  const { state }  = useLocation();
  const location   = useLocation();
  const navigate   = useNavigate();
  const teacher    = state?.teacher;

  const teacherTabs = [
    { name: "Profile", path: "/Teacher_profile", state: { teacher } },
    { name: "Classes", path: "/Teacher_classes", state: { teacher } },
    { name: "Payment", path: "/Teacher_payment", state: { teacher } },
  ];

  const total         = paymentData.length;
  const paid          = paymentData.filter((p) => p.status === "paid").length;
  const percent       = Math.round((paid / total) * 100);
  const radius        = 60;
  const stroke        = 12;
  const circumference = 2 * Math.PI * radius;
  const offset        = circumference - (percent / 100) * circumference;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-10" style={{ padding: "30px 16px" }}>

        {/* Title */}
        <h1 className="text-2xl text-[#701366] font-Inter font-semibold" style={{ marginBottom: "16px" }}>
          Payments
        </h1>

        {/* Tabs + Back button — untouched from original */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1 bg-[#f8e0f8] p-1 rounded-xl">
            {teacherTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => navigate(tab.path, { state: { teacher } })}
                style={{
                  padding: "6px 18px", borderRadius: "10px",
                  fontSize: "13px", fontFamily: "Inter, sans-serif",
                  fontWeight: "500", cursor: "pointer", border: "none",
                  transition: "all 0.2s",
                  background: location.pathname === tab.path ? "#701366" : "transparent",
                  color:      location.pathname === tab.path ? "#fff"    : "#701366",
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/Teachers")}
            style={{
              padding: "8px 20px", borderRadius: "8px",
              border: "1.5px solid #e2d0e2", background: "#fff",
              color: "#701366", fontSize: "13px",
              fontFamily: "Inter, sans-serif", cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "#701366"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#e2d0e2"; }}
          >
            Back
          </button>
        </div>

        {/* Table + Donut */}
        <div style={{ display: "flex", gap: "40px", alignItems: "start" }}>

          {/* LEFT — Table bigger */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ flex: "3" }}>
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8E0F8] text-[#701366] text-left" style={{ height: "52px" }}>
                  <th className="text-sm font-semibold" style={{ paddingLeft: "28px" }}>Month</th>
                  <th className="text-sm font-semibold" style={{ padding: "0 20px" }}>Amount</th>
                  <th className="text-sm font-semibold" style={{ padding: "0 20px" }}>Classes</th>
                  <th className="text-sm font-semibold" style={{ padding: "0 20px" }}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8e0f8]">
                {paymentData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fffafe] transition-colors" style={{ height: "56px" }}>
                    <td className="text-[#701366] text-sm" style={{ paddingLeft: "28px" }}>{item.month}</td>
                    <td className="text-[#701366] text-sm" style={{ padding: "0 20px" }}>{item.amount}</td>
                    <td className="text-[#701366] text-sm" style={{ padding: "0 20px" }}>{item.classes}</td>
                    <td style={{ padding: "0 20px" }}>{statusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT — Donut aligned to the right */}
          <div
            className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center"
            style={{ flex: "1", padding: "28px 20px", alignSelf: "stretch" }}
          >
            <h3 className="text-[#701366] font-Inter font-semibold" style={{ fontSize: "15px", marginBottom: "16px" }}>
              Payment Rate
            </h3>

            <div className="flex gap-4 text-xs mb-5">
              <div className="flex items-center gap-1.5" style={{ color: "#854d0e" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fde68a", display: "inline-block" }} />
                Pending
              </div>
              <div className="flex items-center gap-1.5" style={{ color: "#701366" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#701366", display: "inline-block" }} />
                Paid
              </div>
            </div>

            <div className="relative" style={{ width: "160px", height: "160px" }}>
              <svg className="w-full h-full" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={radius} stroke="#f3f4f6" strokeWidth={stroke} fill="none" />
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ fontSize: "22px", fontWeight: "700", color: "#701366", fontFamily: "Inter, sans-serif" }}>
                  {percent}%
                </span>
                <span style={{ fontSize: "10px", color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>paid</span>
              </div>
            </div>

            {/* Summary */}
            <div className="flex gap-6 mt-6">
              <div className="flex flex-col items-center">
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#701366", fontFamily: "Inter, sans-serif" }}>{paid}</span>
                <span style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>Paid</span>
              </div>
              <div style={{ width: "1px", background: "#f8e0f8" }} />
              <div className="flex flex-col items-center">
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#ca8a04", fontFamily: "Inter, sans-serif" }}>{total - paid}</span>
                <span style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>Pending</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}