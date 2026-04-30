import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import { useLocation } from "react-router-dom";

const statusStyles = {
  green:  { background: "#dcfce7", color: "#16a34a" },
  yellow: { background: "#fef9c3", color: "#ca8a04" },
};

const paymentData = [
  { month: "January",  amount: "15,000 DA", classes: 2, status: { text: "Paid",    color: "green"  } },
  { month: "February", amount: "25,000 DA", classes: 4, status: { text: "Paid",    color: "green"  } },
  { month: "March",    amount: "35,000 DA", classes: 5, status: { text: "Pending", color: "yellow" } },
  { month: "April",    amount: "45,000 DA", classes: 6, status: { text: "Pending", color: "yellow" } },
];

const thStyle = { padding: "12px 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", color: "#701366" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap" };

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
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        <h2 style={{ fontSize: "24px", color: "#701366", margin: 0, flexShrink: 0 }}>Payments</h2>

        <Tabs tabs={teacherTabs} />

        <div style={{ display: "flex", gap: "24px", alignItems: "stretch", minWidth: 0 }}>

          {/* LEFT — Table */}
          <div style={{ flex: "0 0 66.666%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", boxSizing: "border-box", minWidth: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "#F8E0F8", height: "48px" }}>
                  <th style={{ ...thStyle, paddingLeft: "30px", width: "30%" }}>Month</th>
                  <th style={{ ...thStyle, width: "28%" }}>Amount</th>
                  <th style={{ ...thStyle, width: "18%" }}>Classes</th>
                  <th style={{ ...thStyle, width: "24%" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...tdStyle, paddingLeft: "30px" }}>{item.month}</td>
                    <td style={tdStyle}>{item.amount}</td>
                    <td style={tdStyle}>{item.classes}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "3px 12px", borderRadius: "9999px",
                        fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap",
                        ...statusStyles[item.status.color],
                      }}>
                        ● {item.status.text}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT — Donut */}
          <div style={{ flex: "0 0 33.333%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box", minWidth: 0 }}>
            <h3 style={{ fontSize: "20px", color: "#701366", marginBottom: "16px", flexShrink: 0 }}>Payment Rate</h3>
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
                <span style={{ fontSize: "20px", color: "#701366" }}>{percent}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}