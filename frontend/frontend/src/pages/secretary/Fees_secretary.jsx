import React, { useState } from "react";
import Secretary_layout from "../../layouts/Secretary_layout";
import Searchbar from "../../components/Searchbar";
import { Wallet, TrendingUp, TrendingDown, GraduationCap } from "lucide-react";

// ─── STUDENT PAYMENTS DATA ─────────────────────────────────────
const studentPaymentsData = [
  { id: 1, name: "Amira Bouzid",   level: "Beginner A1",  month: "April 2026", amount: "3,500 DA", status: { text: "Paid",    color: "green"  } },
  { id: 2, name: "Yacine Khaldi",  level: "Pre-Inter B1", month: "April 2026", amount: "4,000 DA", status: { text: "Unpaid",  color: "red"    } },
  { id: 3, name: "Sara Mansouri",  level: "Advanced C1",  month: "April 2026", amount: "4,500 DA", status: { text: "Paid",    color: "green"  } },
  { id: 4, name: "Riad Ferhat",    level: "Beginner A2",  month: "April 2026", amount: "3,500 DA", status: { text: "Partial", color: "orange" } },
  { id: 5, name: "Nadia Tlemcani", level: "Inter B2",     month: "April 2026", amount: "4,000 DA", status: { text: "Unpaid",  color: "red"    } },
  { id: 6, name: "Karim Bouras",   level: "Advanced C2",  month: "April 2026", amount: "4,500 DA", status: { text: "Paid",    color: "green"  } },
];

// ─── SHARED STYLES ─────────────────────────────────────────────
const F = "'Inter', sans-serif";

const statusColor = {
  green:  { background: "#dcfce7", color: "#16a34a" },
  red:    { background: "#fee2e2", color: "#dc2626" },
  orange: { background: "#fff7ed", color: "#ea580c" },
};

const getLevelBadge = () => ({ background: "#f0f9ff", color: "#0369a1" });

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

// ─── STUDENTS TAB ──────────────────────────────────────────────
function StudentsTab({ search = "", filter = "All" }) {
  const totalPaid    = studentPaymentsData.filter((s) => s.status.text === "Paid").length;
  const totalUnpaid  = studentPaymentsData.filter((s) => s.status.text === "Unpaid").length;
  const totalPartial = studentPaymentsData.filter((s) => s.status.text === "Partial").length;
  const total        = studentPaymentsData.length;

  const filtered = studentPaymentsData.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.level.toLowerCase().includes(q) || s.month.toLowerCase().includes(q) || s.status.text.toLowerCase().includes(q);
    const matchFilter = filter === "All" || s.status.text === filter || s.level.toLowerCase().includes(filter.toLowerCase());
    return matchSearch && matchFilter;
  });

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <SummaryCard icon={GraduationCap} label="Total Students"  value={`${total} students`}                        iconBg="#f8e0f8" iconColor="#701366" />
        <SummaryCard icon={Wallet}        label="Total Collected"  value="21,500 DA"                                  iconBg="#eff6ff" iconColor="#2563eb" />
        <SummaryCard icon={TrendingUp}    label="Paid"             value={`${totalPaid} / ${total}`}                  iconBg="#dcfce7" iconColor="#16a34a" />
        <SummaryCard icon={TrendingDown}  label="Unpaid / Partial" value={`${totalUnpaid + totalPartial} / ${total}`} iconBg="#fee2e2" iconColor="#dc2626" />
      </div>

      <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ background: "#F8E0F8", height: "48px" }}>
              <th style={{ ...thStyle, paddingLeft: "20px", width: "24%" }}>Student Name</th>
              <th style={{ ...thStyle, width: "20%" }}>Level</th>
              <th style={{ ...thStyle, width: "20%" }}>Month</th>
              <th style={{ ...thStyle, width: "18%" }}>Amount</th>
              <th style={{ ...thStyle, width: "18%" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>No records found.</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id} style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}
              >
                <td style={{ ...tdStyle, paddingLeft: "20px" }}>{s.name}</td>
                <td style={tdStyle}>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, whiteSpace: "nowrap", ...getLevelBadge() }}>
                    {s.level}
                  </span>
                </td>
                <td style={tdStyle}>{s.month}</td>
                <td style={{ ...tdStyle, fontFamily: F }}>{s.amount}</td>
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
    </>
  );
}

// ─── MAIN FEES SECRETARY PAGE ──────────────────────────────────
export default function Fees_secretary() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  return (
    <Secretary_layout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0, marginTop: "30px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
        <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: F, margin: 0 }}>
          Student Fees
        </h2>
          </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Searchbar
              placeholder="Search by name, level, status..."
              filterOptions={["Paid", "Unpaid", "Partial"]}
              showAdd={true}
              addPath="/Add_student_fees_secretary"
              onSearchChange={(val) => setSearch(val)}
              onFilterChange={(val) => setFilter(val)}
            />
          </div>
        </div>
        </div>

        <StudentsTab search={search} filter={filter} />

      </div>
    </Secretary_layout>
  );
}