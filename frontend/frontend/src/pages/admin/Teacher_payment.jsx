import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import { apiFetch } from "../../services/api";

const paymentStatusStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 600,
  display: "inline-block",
  background: status === "Paid" ? "#e6f7ec" : "#fef9c3",
  color: status === "Paid" ? "#1a7f4b" : "#ca8a04",
});

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const thStyle = {
  padding   : "12px 16px",
  fontSize  : "14px",
  fontWeight: 500,
  textAlign : "center",
  whiteSpace: "nowrap",
  color     : "#701366",
};

const tdStyle = {
  padding   : "12px 16px",
  fontSize  : "14px",
  color     : "#701366",
  whiteSpace: "nowrap",
  textAlign : "center",
};

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

const CURRENT_YEAR = new Date().getFullYear();

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export default function Payment_teacher() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const teacher = state?.teacher;
  const employeeId = teacher?.employee?.person_id;

  const [year, setYear] = useState(CURRENT_YEAR);

  const teacherTabs = [
    { name: "Profile", path: "/Teacher_profile", state: { teacher } },
    { name: "Classes", path: "/Teacher_classes", state: { teacher } },
    { name: "Payment", path: "/Teacher_payment", state: { teacher } },
  ];

  // Cached per teacher+year — flipping to a year you've already viewed
  // this session (including going back to the current year) shows it
  // instantly instead of refetching.
  const { data, isLoading } = useQuery({
    queryKey: ["salaries", employeeId, year],
    queryFn: async () => {
      const res = await apiFetch(`/salaries/employee/${employeeId}/?year=${year}`);
      const json = await res.json();
      return json.salaries ?? [];
    },
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  });

  const salaries = data ?? [];
  const loading  = isLoading;

  const paymentData = salaries
    .slice()
    .sort((a, b) => a.month - b.month)
    .map((s) => ({
      month: MONTH_NAMES[s.month - 1] ?? s.month,
      amount: `${s.amount} DA`,
      paymentDate: formatDate(s.payment_date),
      status: s.status === "paid" ? "Paid" : "Pending",
    }));

  const total   = paymentData.length;
  const paid    = paymentData.filter((p) => p.status === "Paid").length;
  const percent = total > 0 ? Math.round((paid / total) * 100) : 0;

  const radius      = 60;
  const stroke      = 12;
  const circumference = 2 * Math.PI * radius;
  const offset      = circumference - (percent / 100) * circumference;

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
          <button
            onClick={() => navigate("/Teachers")}
            style={backBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#701366",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Teacher Profile
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", flexShrink: 0, minWidth: 0 }}>
          <Tabs tabs={teacherTabs} />
        </div>

        {/* Year selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setYear((y) => y - 1)}
            style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2d0e2", background: "white", color: "#701366", cursor: "pointer" }}
          >‹</button>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#701366", margin: 0, flexShrink: 0 }}>{year} Payments</h2>
          <button
            onClick={() => setYear((y) => y + 1)}
            style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2d0e2", background: "white", color: "#701366", cursor: "pointer" }}
          >›</button>
        </div>

        <div style={{ display: "flex", gap: "24px", alignItems: "stretch", minWidth: 0 }}>

          {/* LEFT — Table */}
          <div style={{ flex: "0 0 66.666%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", boxSizing: "border-box", minWidth: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "#F8E0F8", height: "48px" }}>
                  <th style={{ ...thStyle, width: "20%" }}>Month</th>
                  <th style={{ ...thStyle, width: "20%" }}>Amount</th>
                  <th style={{ ...thStyle, width: "32%" }}>Payment Date</th>
                  <th style={{ ...thStyle, width: "28%" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5 }}>
                      Loading...
                    </td>
                  </tr>
                ) : paymentData.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5 }}>
                      No payments recorded for {year}.
                    </td>
                  </tr>
                ) : paymentData.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={tdStyle}>{item.month}</td>
                    <td style={tdStyle}>{item.amount}</td>
                    <td style={tdStyle}>{item.paymentDate}</td>
                    <td style={tdStyle}>
                      <span style={paymentStatusStyle(item.status)}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT — Donut */}
          <div style={{ flex: "0 0 33.333%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box", minWidth: 0 }}>
            <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", marginBottom: "16px", flexShrink: 0 }}>Payment Rate</h3>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px", marginBottom: "16px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#ca8a04" }}>
                <span style={{ width: "8px", height: "8px", background: "#fde68a", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} /> Unpaid
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#701366" }}>
                <span style={{ width: "8px", height: "8px", background: "#701366", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} /> Paid
              </div>
            </div>
            <div style={{ position: "relative", width: "160px", height: "160px", flexShrink: 0 }}>
              <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={radius} stroke="#eee" strokeWidth={stroke} fill="none" />
                <circle cx="75" cy="75" r={radius} stroke="#701366" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" transform="rotate(-90 75 75)" />
                <circle cx="75" cy="75" r={radius} stroke="#fde68a" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - ((100 - percent) / 100) * circumference}
                  strokeLinecap="round"
                  transform={`rotate(${(percent / 100) * 360 - 90} 75 75)`} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#701366" }}>{percent}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}