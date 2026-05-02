import { useLocation, useNavigate } from "react-router-dom";
import Student_layout from "../../layouts/Student_layout";
import { Wallet, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";

const feesByClass = {
  1: [
    { id: 1, month: "April 2026",    salary: "4,500 DA", status: { text: "Paid",   color: "green" } },
    { id: 2, month: "March 2026",    salary: "4,500 DA", status: { text: "Paid",   color: "green" } },
    { id: 3, month: "February 2026", salary: "4,500 DA", status: { text: "Paid",   color: "green" } },
    { id: 4, month: "January 2026",  salary: "4,500 DA", status: { text: "Unpaid", color: "red"   } },
    { id: 5, month: "December 2025", salary: "4,500 DA", status: { text: "Paid",   color: "green" } },
    { id: 6, month: "November 2025", salary: "4,500 DA", status: { text: "Paid",   color: "green" } },
  ],
  3: [
    { id: 1, month: "April 2026",    salary: "4,000 DA", status: { text: "Unpaid", color: "red"   } },
    { id: 2, month: "March 2026",    salary: "4,000 DA", status: { text: "Paid",   color: "green" } },
    { id: 3, month: "February 2026", salary: "4,000 DA", status: { text: "Paid",   color: "green" } },
    { id: 4, month: "January 2026",  salary: "4,000 DA", status: { text: "Paid",   color: "green" } },
  ],
};

const statusColor = {
  green: { background: "#dcfce7", color: "#16a34a" },
  red:   { background: "#fee2e2", color: "#dc2626" },
};

const F = "'Inter', sans-serif";
const thStyle = { padding: "12px 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", color: "#701366", whiteSpace: "nowrap" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap" };

const SummaryCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div style={{ background: "white", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px", padding: "20px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", flex: 1, minWidth: "180px" }}>
    <div style={{ width: "44px", height: "40px", borderRadius: "12px", background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon style={{ width: "20px", height: "20px" }} />
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 2px 0" }}>{label}</p>
      <p style={{ fontSize: "16px", color: "#701366", fontFamily: F, margin: 0, fontWeight: 500 }}>{value}</p>
    </div>
  </div>
);

export default function Fees_detail_student() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const cls       = state?.cls;

  const records    = feesByClass[cls?.id] || [];
  const total      = records.length;
  const totalPaid  = records.filter(r => r.status.text === "Paid").length;
  const totalUnpaid = records.filter(r => r.status.text === "Unpaid").length;

  return (
    <Student_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header + back */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "#fdf4fd", border: "1px solid #f0d8ee", borderRadius: "10px", padding: "6px 14px", color: "#701366", fontSize: "13px", cursor: "pointer", fontWeight: 400 }}
          >
            ← Back
          </button>
          <div>
            <h2 style={{ fontSize: "24px", color: "#701366", margin: 0 }}>
              Fees — {cls?.name ?? "Class"}
            </h2>
            <p style={{ fontSize: "13px", color: "#b48ab0", margin: "2px 0 0" }}>
              {cls?.language} · {cls?.level} · {cls?.schedule} · {cls?.room}
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <SummaryCard icon={Wallet}       label="Monthly Fee"     value={cls?.monthlyFee ?? "—"}      iconBg="#f8e0f8" iconColor="#701366" />
          <SummaryCard icon={CheckCircle}  label="Total Months"    value={`${total} months`}            iconBg="#eff6ff" iconColor="#2563eb" />
          <SummaryCard icon={TrendingUp}   label="Paid"            value={`${totalPaid} / ${total}`}    iconBg="#dcfce7" iconColor="#16a34a" />
          <SummaryCard icon={TrendingDown} label="Unpaid"          value={`${totalUnpaid} / ${total}`}  iconBg="#fee2e2" iconColor="#dc2626" />
        </div>

        {/* Payment table */}
        <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "24px", width: "45%" }}>Month</th>
                <th style={{ ...thStyle, width: "30%" }}>Amount</th>
                <th style={{ ...thStyle, width: "25%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "#b48ab0", fontSize: "14px" }}>
                    No payment records found.
                  </td>
                </tr>
              ) : records.map((r) => (
                <tr
                  key={r.id}
                  style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <td style={{ ...tdStyle, paddingLeft: "24px" }}>{r.month}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{r.salary}</td>
                  <td style={tdStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 500, ...statusColor[r.status.color] }}>
                      ● {r.status.text}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </Student_layout>
  );
}