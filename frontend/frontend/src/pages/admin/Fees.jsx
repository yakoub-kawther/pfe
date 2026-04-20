import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Searchbar from "../../components/Searchbar";
import { Wallet, TrendingUp, TrendingDown, Users } from "lucide-react";

// ─── DATA ───────────────────────────────────────────────────
const feesData = [
  { id: 1, name: "Benahmed Ahmed", role: "Teacher",     month: "April 2026", salary: "45,000 DA", status: { text: "Paid",   color: "green" } },
  { id: 2, name: "Benali Ali",     role: "Teacher",     month: "April 2026", salary: "45,000 DA", status: { text: "Unpaid", color: "red"   } },
  { id: 3, name: "test",           role: "Secretariat", month: "April 2026", salary: "30,000 DA", status: { text: "Paid",   color: "green" } },
  { id: 4, name: "test2",          role: "Housemaid",   month: "April 2026", salary: "28,000 DA", status: { text: "Unpaid", color: "red"   } },
  { id: 5, name: "test3",          role: "Agent",       month: "April 2026", salary: "28,000 DA", status: { text: "Paid",   color: "green" } },
];

const statusStyles = {
  green: "bg-green-100 text-green-600",
  red:   "bg-red-100 text-red-600",
};

// Purple for Teacher, blue for ANY other role
const getRoleBadge = (role) =>
  role === "Teacher"
    ? "bg-[#f8e0f8] text-[#701366]"
    : "bg-blue-50 text-blue-600";

// ─── SUMMARY CARD ────────────────────────────────────────────
const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div
    className="bg-white rounded-2xl flex items-center gap-4"
    style={{ padding: "20px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
  >
    <div
      className={`flex items-center justify-center rounded-xl ${color}`}
      style={{ width: "44px", height: "44px", flexShrink: 0 }}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-[#701366] font-Inter text-base">{value}</p>
    </div>
  </div>
);

// ─── COMPONENT ───────────────────────────────────────────────
export default function Fees() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const totalPaid   = feesData.filter((f) => f.status.text === "Paid").length;
  const totalUnpaid = feesData.filter((f) => f.status.text === "Unpaid").length;
  const totalStaff  = feesData.length;

  const filtered = feesData.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch =
      f.name.toLowerCase().includes(q) ||
      f.role.toLowerCase().includes(q) ||
      f.month.toLowerCase().includes(q) ||
      f.status.text.toLowerCase().includes(q);
    const matchFilter =
      filter === "All" ||
      f.status.text === filter ||
      f.role === filter ||
      (filter === "Employee" && f.role !== "Teacher");
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto flex flex-col gap-8 pt-6" style={{ marginTop: "30px" }}>

        {/* Header */}
        <div className="flex items-center justify-between flex-nowrap gap-4">
          <h2 className="text-2xl font-Inter text-[#701366] whitespace-nowrap">Fees & Salaries</h2>
          <div className="flex-shrink-0">
           <Searchbar
            placeholder="Search by name, role, status..."
            filterOptions={["Paid", "Unpaid", "Teacher", "Employee"]}
            showAdd={false}
            onSearchChange={(val) => setSearch(val)}
            onFilterChange={(val) => setFilter(val)}
            />
         </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4" style={{ gap: "16px" }}>
          <SummaryCard icon={Users}       label="Total Staff"     value={`${totalStaff} people`} color="bg-[#f8e0f8] text-[#701366]" />
          <SummaryCard icon={Wallet}      label="Total Salaries"  value="176,000 DA"              color="bg-blue-50 text-blue-600"    />
          <SummaryCard icon={TrendingUp}  label="Paid"            value={`${totalPaid} / ${totalStaff}`}   color="bg-green-100 text-green-600" />
          <SummaryCard icon={TrendingDown} label="Unpaid"         value={`${totalUnpaid} / ${totalStaff}`} color="bg-red-100 text-red-600"     />
        </div>

        {/* Table */}
        <div className="w-full px-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                <th className="py-3 text-sm" style={{ paddingLeft: "20px" }}>Name</th>
                <th className="px-4 py-3 text-sm">Role</th>
                <th className="px-4 py-3 text-sm">Month</th>
                <th className="px-4 py-3 text-sm">Salary</th>
                <th className="px-4 py-3 text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8e0f8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#701366] opacity-50 text-sm">
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-[#fffafe] transition-colors duration-100 h-12">
                    <td className="py-3 text-[#701366]" style={{ paddingLeft: "20px" }}>{f.name}</td>
                    <td className="px-4 py-3">

                      {/* Purple for Teacher, blue for Secretariat / Housemaid / Agent / any other role */}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-Inter ${getRoleBadge(f.role)}`}>
                        {f.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#701366]">{f.month}</td>
                    <td className="px-4 py-3 text-[#701366] font-Inter">{f.salary}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-Inter ${statusStyles[f.status.color]}`}>
                        ● {f.status.text}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}