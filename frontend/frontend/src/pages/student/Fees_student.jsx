import { useNavigate } from "react-router-dom";
import Student_layout from "../../layouts/Student_layout";
import Searchbar from "../../components/Searchbar";
import { useState } from "react";

const classesData = [
  { id: 1, name: "Eng-A2", language: "English", level: "A2", schedule: "Mon / Wed 10:00", room: "Room 1", monthlyFee: "4,500 DA" },
  { id: 2, name: "Eng-B1", language: "English", level: "B1", schedule: "Tue / Thu 14:00", room: "Room 2", monthlyFee: "4,500 DA" },
  { id: 3, name: "Fr-A1",  language: "French",  level: "A1", schedule: "Mon / Fri 09:00", room: "Room 3", monthlyFee: "4,000 DA" },
  { id: 4, name: "Eng-C1", language: "English", level: "C1", schedule: "Wed / Fri 11:00", room: "Room 4", monthlyFee: "5,000 DA" },
];

const myClassIds = [1, 3];

// Quick summary per class to show in the list
const feesByClass = {
  1: [
    { month: "April 2026",    status: "Paid"   },
    { month: "March 2026",    status: "Paid"   },
    { month: "February 2026", status: "Paid"   },
    { month: "January 2026",  status: "Unpaid" },
    { month: "December 2025", status: "Paid"   },
    { month: "November 2025", status: "Paid"   },
  ],
  3: [
    { month: "April 2026",    status: "Unpaid" },
    { month: "March 2026",    status: "Paid"   },
    { month: "February 2026", status: "Paid"   },
    { month: "January 2026",  status: "Paid"   },
  ],
};

const levelColors = {
  A1: { bg: "#e0f2fe", color: "#0369a1" },
  A2: { bg: "#dbeafe", color: "#1d4ed8" },
  B1: { bg: "#ede9fe", color: "#7c3aed" },
  B2: { bg: "#fae8ff", color: "#a21caf" },
  C1: { bg: "#fce7f3", color: "#be185d" },
  C2: { bg: "#ffe4e6", color: "#be123c" },
};

export default function Fees_student() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const myClasses = classesData.filter(c => myClassIds.includes(c.id));
  const filtered  = myClasses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.language.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Student_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "24px", color: "#701366", margin: 0 }}>My Fees</h2>
            <p style={{ fontSize: "13px", color: "#b48ab0", margin: "4px 0 0" }}>Select a class to view your payment history</p>
          </div>
          <div style={{ flex: 1, maxWidth: "380px", minWidth: "200px" }}>
            <Searchbar
              placeholder="Search by class or language..."
              showAdd={false}
              onSearchChange={(val) => setSearch(val)}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "white", fontFamily: "Inter, sans-serif", borderRadius: "18px", boxShadow: "0 2px 12px rgba(112,19,102,0.08)", overflow: "hidden", border: "1px solid #f5e0f3" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #f8e0f8 0%, #fdf4fd 100%)", height: "52px" }}>
                {[
                  { label: "Class",       width: "18%", pl: "28px" },
                  { label: "Language",    width: "16%" },
                  { label: "Level",       width: "12%" },
                  { label: "Schedule",    width: "22%" },
                  { label: "Monthly Fee", width: "16%" },
                  { label: "Status",      width: "16%" },
                ].map(({ label, width, pl }) => (
                  <th key={label} style={{ width, paddingLeft: pl || "16px", paddingRight: "16px", fontSize: "12px", fontWeight: 500, textAlign: "left", color: "#701366", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>
                    No classes found.
                  </td>
                </tr>
              ) : filtered.map((cls) => {
                const lc       = levelColors[cls.level] || { bg: "#f3f4f6", color: "#374151" };
                const records  = feesByClass[cls.id] || [];
                const hasUnpaid = records.some(r => r.status === "Unpaid");

                return (
                  <tr
                    key={cls.id}
                    onClick={() => navigate("/Fees_detail_student", { state: { cls } })}
                    style={{ height: "56px", borderBottom: "1px solid #faeaf9", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fdf6fd"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ paddingLeft: "28px", paddingRight: "16px", fontSize: "14px", fontWeight: 500, color: "#701366" }}>{cls.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#701366" }}>{cls.language}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: lc.bg, color: lc.color, padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                        {cls.level}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#701366" }}>{cls.schedule}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600, color: "#701366" }}>{cls.monthlyFee}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 500,
                        background: hasUnpaid ? "#fee2e2" : "#dcfce7",
                        color:      hasUnpaid ? "#dc2626" : "#16a34a",
                      }}>
                        ● {hasUnpaid ? "Has Unpaid" : "All Paid"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </Student_layout>
  );
}