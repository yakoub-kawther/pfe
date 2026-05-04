import React, { useState } from "react";
import Teacher_layout from "../../layouts/Teacher_layout";
import Searchbar from "../../components/Searchbar";
import { Wallet, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";

// ─── LOGGED-IN TEACHER DATA ────────────────────────────────────
// In a real app, filter by the authenticated teacher's ID/name
const CURRENT_TEACHER_NAME = "Benahmed Ahmed";

const allSalaries = [
  { id: 1,  name: "Benahmed Ahmed", month: "April 2026",    salary: "45,000 DA", status: { text: "Paid",   color: "green" } },
  { id: 2,  name: "Benahmed Ahmed", month: "March 2026",    salary: "45,000 DA", status: { text: "Paid",   color: "green" } },
  { id: 3,  name: "Benahmed Ahmed", month: "February 2026", salary: "45,000 DA", status: { text: "Paid",   color: "green" } },
  { id: 4,  name: "Benahmed Ahmed", month: "January 2026",  salary: "45,000 DA", status: { text: "Unpaid", color: "red"   } },
  { id: 5,  name: "Benahmed Ahmed", month: "December 2025", salary: "45,000 DA", status: { text: "Paid",   color: "green" } },
  { id: 6,  name: "Benahmed Ahmed", month: "November 2025", salary: "45,000 DA", status: { text: "Paid",   color: "green" } },
];

// ─── SHARED STYLES ─────────────────────────────────────────────
const F = "'Inter', sans-serif";

const statusColor = {
  green: { background: "#dcfce7", color: "#16a34a" },
  red:   { background: "#fee2e2", color: "#dc2626" },
};

const thStyle = { padding: "12px 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", color: "#701366" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap" };

// ─── SUMMARY CARD ──────────────────────────────────────────────
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

// ─── MAIN FEES PAGE ────────────────────────────────────────────
export default function Fees() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Only this teacher's records
  const mySalaries = allSalaries.filter((s) => s.name === CURRENT_TEACHER_NAME);

  const totalPaid   = mySalaries.filter((s) => s.status.text === "Paid").length;
  const totalUnpaid = mySalaries.filter((s) => s.status.text === "Unpaid").length;
  const total       = mySalaries.length;

  const filtered = mySalaries.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.month.toLowerCase().includes(q) ||
      s.salary.toLowerCase().includes(q) ||
      s.status.text.toLowerCase().includes(q);
    const matchFilter =
      filter === "All" || s.status.text === filter;
    return matchSearch && matchFilter;
  });

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto",fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: F, margin: 0 }}>
              My Salary
            </h2>
          </div>
        {/* Search / Filter bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Searchbar
              placeholder="Search by month or status..."
              filterOptions={["Paid", "Unpaid"]}
              showAdd={false}
              addPath={false}
              onSearchChange={(val) => setSearch(val)}
              onFilterChange={(val) => setFilter(val)}
            />
          </div>
        </div>
        </div>


        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <SummaryCard icon={Wallet}      label="Monthly Salary" value="45,000 DA"                        iconBg="#f8e0f8" iconColor="#701366" />
          <SummaryCard icon={CheckCircle} label="Total Received"  value={`${totalPaid} months`}            iconBg="#eff6ff" iconColor="#2563eb" />
          <SummaryCard icon={TrendingUp}  label="Paid"            value={`${totalPaid} / ${total}`}        iconBg="#dcfce7" iconColor="#16a34a" />
          <SummaryCard icon={TrendingDown} label="Unpaid"         value={`${totalUnpaid} / ${total}`}      iconBg="#fee2e2" iconColor="#dc2626" />
        </div>

        {/* Salary table */}
        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "20px", width: "40%" }}>Month</th>
                <th style={{ ...thStyle, width: "35%" }}>Salary</th>
                <th style={{ ...thStyle, width: "25%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>
                    No records found.
                  </td>
                </tr>
              ) : filtered.map((s) => (
                <tr
                  key={s.id}
                  style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <td style={{ ...tdStyle, paddingLeft: "20px" }}>{s.month}</td>
                  <td style={{ ...tdStyle, fontFamily: F }}>{s.salary}</td>
                  <td style={tdStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, whiteSpace: "nowrap", ...statusColor[s.status.color] }}>
                      ● {s.status.text}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </Teacher_layout>
  );
}