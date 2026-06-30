import React, { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Searchbar from "../../components/Searchbar";
import { Wallet, TrendingUp, TrendingDown, Users } from "lucide-react";

const F = "'Inter', sans-serif";

const feesData = [
  { id: 1, name: "Benahmed Ahmed", role: "Teacher",     month: "April 2026", salary: "45,000 DA", status: { text: "Paid",   color: "green" } },
  { id: 2, name: "Benali Ali",     role: "Teacher",     month: "April 2026", salary: "45,000 DA", status: { text: "Unpaid", color: "red"   } },
  { id: 3, name: "test",           role: "Secretariat", month: "April 2026", salary: "30,000 DA", status: { text: "Paid",   color: "green" } },
  { id: 4, name: "test2",          role: "Housemaid",   month: "April 2026", salary: "28,000 DA", status: { text: "Unpaid", color: "red"   } },
  { id: 5, name: "test3",          role: "Agent",       month: "April 2026", salary: "28,000 DA", status: { text: "Paid",   color: "green" } },
];

const statusColor = {
  green: { background: "#dcfce7", color: "#16a34a" },
  red:   { background: "#fee2e2", color: "#dc2626" },
};

const getRoleBadge = (role) => role === "Teacher"
  ? { background: "#f8e0f8", color: "#701366" }
  : { background: "#eff6ff", color: "#2563eb" };

const thStyle = { padding: "12px 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", color: "#701366" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap" };

const SummaryCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div style={{ background: "white", borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px", padding: "20px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", boxSizing: "border-box", minWidth: 0 }}>
    <div style={{ width: "44px", height: "40px", borderRadius: "12px", background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon style={{ width: "20px", height: "20px" }} />
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 2px 0" }}>{label}</p>
      <p style={{ fontSize: "16px", color: "#701366", fontFamily: F, margin: 0 }}>{value}</p>
    </div>
  </div>
);

export default function Salaries() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const totalPaid   = feesData.filter(f => f.status.text === "Paid").length;
  const totalUnpaid = feesData.filter(f => f.status.text === "Unpaid").length;
  const total       = feesData.length;

  const filtered = feesData.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = f.name.toLowerCase().includes(q) || f.role.toLowerCase().includes(q) || f.month.toLowerCase().includes(q) || f.status.text.toLowerCase().includes(q);
    const matchFilter = filter === "All" || f.status.text === filter || f.role === filter || (filter === "Employee" && f.role !== "Teacher");
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0, marginTop: "30px" }}>

        <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: F, margin: 0 }}>Staff Salaries</h2>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <Searchbar
            placeholder="Search by name, role, status..."
            filterOptions={["Paid", "Unpaid", "Teacher", "Employee"]}
            showAdd={true}
            addPath="/Add_employees_fees"
            onSearchChange={val => setSearch(val)}
            onFilterChange={val => setFilter(val)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <SummaryCard icon={Users}        label="Total Staff"    value={`${total} people`}         iconBg="#f8e0f8" iconColor="#701366" />
          <SummaryCard icon={Wallet}       label="Total Salaries" value="176,000 DA"                iconBg="#eff6ff" iconColor="#2563eb" />
          <SummaryCard icon={TrendingUp}   label="Paid"           value={`${totalPaid} / ${total}`} iconBg="#dcfce7" iconColor="#16a34a" />
          <SummaryCard icon={TrendingDown} label="Unpaid"         value={`${totalUnpaid} / ${total}`} iconBg="#fee2e2" iconColor="#dc2626" />
        </div>

        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "20px", width: "25%" }}>Name</th>
                <th style={{ ...thStyle, width: "18%" }}>Role</th>
                <th style={{ ...thStyle, width: "20%" }}>Month</th>
                <th style={{ ...thStyle, width: "18%" }}>Salary</th>
                <th style={{ ...thStyle, width: "19%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>No records found.</td></tr>
              ) : filtered.map(f => (
                <tr key={f.id} style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <td style={{ ...tdStyle, paddingLeft: "20px" }}>{f.name}</td>
                  <td style={tdStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, whiteSpace: "nowrap", ...getRoleBadge(f.role) }}>
                      {f.role}
                    </span>
                  </td>
                  <td style={tdStyle}>{f.month}</td>
                  <td style={{ ...tdStyle, fontFamily: F }}>{f.salary}</td>
                  <td style={tdStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, whiteSpace: "nowrap", ...statusColor[f.status.color] }}>
                      ● {f.status.text}
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