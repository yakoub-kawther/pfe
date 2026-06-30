import { useState, useEffect } from "react";
import Teacher_layout from "../../layouts/Teacher_layout";
import Searchbar from "../../components/Searchbar";
import { apiFetch } from "../../services/api";
import { Wallet, TrendingUp, TrendingDown, CheckCircle, Loader2 } from "lucide-react";

const F = "'Inter', sans-serif";

const thStyle = { padding: "12px 16px", fontSize: "14px", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap", color: "#701366" };
const tdStyle = { padding: "12px 16px", fontSize: "14px", color: "#701366", whiteSpace: "nowrap" };

const statusColor = {
  paid:    { background: "#dcfce7", color: "#16a34a" },
  unpaid:  { background: "#fee2e2", color: "#dc2626" },
  pending: { background: "#fef9c3", color: "#854d0e" },
};

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

export default function Fees() {
  const [salaries, setSalaries] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Get current user
        const meRes  = await apiFetch("/account/me/");
        const me     = await meRes.json();
        const empId  = me?.person_id;
        if (!empId) throw new Error("Could not resolve employee ID.");

        // 2. Fetch salaries for this employee
        const res  = await apiFetch(`/salary/employee/${empId}/`);
        if (!res.ok) throw new Error("Salary data is not available yet. Please contact your administrator.");
        const data = await res.json();
        setSalaries(Array.isArray(data) ? data : (data.results ?? []));
      } catch (err) {
        setError(err.message || "Failed to load salary data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived stats ─────────────────────────────────────────
  const total       = salaries.length;
  const totalPaid   = salaries.filter(s => s.status?.toLowerCase() === "paid").length;
  const totalUnpaid = salaries.filter(s => s.status?.toLowerCase() === "unpaid").length;
  const latestAmount = salaries.length > 0 ? `${salaries[0].amount} DA` : "—";

  // ── Filter + search ───────────────────────────────────────
  const filtered = salaries.filter(s => {
    const q           = search.toLowerCase();
    const date        = s.payment_date ?? "";
    const amount      = String(s.amount ?? "");
    const status      = s.status ?? "";
    const matchSearch = date.includes(q) || amount.includes(q) || status.toLowerCase().includes(q);
    const matchFilter = filter === "All" || status.toLowerCase() === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  // ── Format date to "Month YYYY" ───────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  };

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: F, margin: 0 }}>My Salary</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Searchbar
              placeholder="Search by month or status..."
              filterOptions={["Paid", "Unpaid"]}
              showAdd={false}
              addPath={false}
              onSearchChange={val => setSearch(val)}
              onFilterChange={val => setFilter(val)}
            />
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <SummaryCard icon={Wallet}       label="Latest Salary"   value={latestAmount}             iconBg="#f8e0f8" iconColor="#701366" />
          <SummaryCard icon={CheckCircle}  label="Total Received"  value={`${totalPaid} months`}    iconBg="#eff6ff" iconColor="#2563eb" />
          <SummaryCard icon={TrendingUp}   label="Paid"            value={`${totalPaid} / ${total}`}   iconBg="#dcfce7" iconColor="#16a34a" />
          <SummaryCard icon={TrendingDown} label="Unpaid"          value={`${totalUnpaid} / ${total}`} iconBg="#fee2e2" iconColor="#dc2626" />
        </div>

        {/* Table */}
        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "20px", width: "40%" }}>Month</th>
                <th style={{ ...thStyle, width: "35%" }}>Amount</th>
                <th style={{ ...thStyle, width: "25%" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#701366", opacity: 0.6 }}>
                      <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: "14px" }}>Loading...</span>
                      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr><td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "#dc2626", fontSize: "14px" }}>{error}</td></tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>No records found.</td></tr>
              )}
              {!loading && !error && filtered.map(s => {
                const st  = (s.status ?? "").toLowerCase();
                const clr = statusColor[st] ?? statusColor.unpaid;
                return (
                  <tr
                    key={s.id}
                    style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ ...tdStyle, paddingLeft: "20px" }}>{formatDate(s.payment_date)}</td>
                    <td style={{ ...tdStyle, fontFamily: F }}>{s.amount ? `${s.amount} DA` : "—"}</td>
                    <td style={tdStyle}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, whiteSpace: "nowrap", ...clr }}>
                        ● {s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </Teacher_layout>
  );
}