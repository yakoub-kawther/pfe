import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Searchbar from "../../components/Searchbar";
import { Wallet, TrendingUp, TrendingDown, Users, Loader2 } from "lucide-react";
import { apiFetch } from "../../services/api";

const F = "'Inter', sans-serif";

const getStatusStyle = (statusText = "") => {
  const s = statusText.toLowerCase();
  if (s === "paid")    return { background: "#dcfce7", color: "#16a34a" };
  if (s === "unpaid")  return { background: "#fee2e2", color: "#dc2626" };
  if (s === "pending") return { background: "#fef9c3", color: "#854d0e" };
  return { background: "#fee2e2", color: "#dc2626" };
};

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

const LoadingRow = ({ cols }) => (
  <tr>
    <td colSpan={cols} style={{ textAlign: "center", padding: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#701366", opacity: 0.6 }}>
        <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "14px" }}>Loading...</span>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </td>
  </tr>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

const fmtAmount = (val) =>
  val != null ? `${Number(val).toLocaleString("fr-DZ")} DA` : "—";

// ─── Salary Row ───────────────────────────────────────────────
function SalaryRow({ salary: s, onUpdate }) {
  const [marking, setMarking] = useState(false);

  const markPaid = async (e) => {
    e.stopPropagation();
    setMarking(true);
    try {
      const res = await apiFetch(`/saleries/${s.id}/mark-paid/`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onUpdate(data.data ?? data);
    } catch {
      alert("Failed to mark as paid.");
    } finally {
      setMarking(false);
    }
  };

  const isPaid = s.status?.toLowerCase() === "paid";

  return (
    <tr
      style={{ height: "48px", borderBottom: "1px solid #f8e0f8", transition: "background 0.1s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
      onMouseLeave={e => e.currentTarget.style.background = "white"}
    >
      <td style={{ ...tdStyle, paddingLeft: "20px" }}>{s.employee_name || "—"}</td>
      <td style={tdStyle}>{formatDate(s.payment_date)}</td>
      <td style={{ ...tdStyle, fontFamily: F }}>{fmtAmount(s.amount)}</td>
      <td style={tdStyle}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontFamily: F, whiteSpace: "nowrap", ...getStatusStyle(s.status) }}>
          ● {s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : "—"}
        </span>
      </td>
      <td style={tdStyle}>
        {!isPaid && (
          <button
            onClick={markPaid}
            disabled={marking}
            style={{ padding: "4px 14px", borderRadius: "8px", border: "none", cursor: marking ? "not-allowed" : "pointer", background: "#f8e0f8", color: "#701366", fontSize: "12px", fontFamily: F, fontWeight: 500, opacity: marking ? 0.6 : 1, transition: "opacity 0.15s" }}
          >
            {marking ? "…" : "Mark Paid"}
          </button>
        )}
        {isPaid && <span style={{ fontSize: "12px", color: "#16a34a" }}>✓ Paid</span>}
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function Fees() {
  const [salaries, setSalaries] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");

  useEffect(() => {
    const load = async () => {
      try {
        const [listRes, statsRes] = await Promise.all([
          apiFetch("/saleries/"),
          apiFetch("/saleries/stats/"),
        ]);
        if (!listRes.ok)  throw new Error("Failed to load salaries.");
        if (!statsRes.ok) throw new Error("Failed to load stats.");

        const listData  = await listRes.json();
        const statsData = await statsRes.json();

        setSalaries(Array.isArray(listData) ? listData : (listData.results ?? []));
        setStats(statsData);
      } catch (err) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived stats ─────────────────────────────────────────
  const total       = salaries.length;
  const totalPaid   = salaries.filter(s => s.status?.toLowerCase() === "paid").length;
  const totalUnpaid = salaries.filter(s => s.status?.toLowerCase() !== "paid").length;

  // ── Filter + search ───────────────────────────────────────
  const filtered = salaries.filter((s) => {
    const q           = search.toLowerCase();
    const name        = (s.employee_name ?? "").toLowerCase();
    const date        = (s.payment_date  ?? "").toLowerCase();
    const amount      = String(s.amount  ?? "");
    const st          = (s.status        ?? "").toLowerCase();
    const matchSearch = name.includes(q) || date.includes(q) || amount.includes(q) || st.includes(q);
    const matchFilter = filter === "All" || st === filter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0, marginTop: "30px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: F, margin: 0 }}>Staff Salaries</h2>
          <Searchbar
            placeholder="Search by name, month, status..."
            filterOptions={["Paid", "Unpaid", "Pending"]}
            showAdd={true}
            addPath="/Add_employees_fees"
            onSearchChange={val => setSearch(val)}
            onFilterChange={val => setFilter(val)}
          />
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          <SummaryCard icon={Users}        label="Total Staff"    value={loading ? "…" : `${total} people`}              iconBg="#f8e0f8" iconColor="#701366" />
          <SummaryCard icon={Wallet}       label="Total Salaries" value={loading || !stats ? "…" : fmtAmount(stats.total_overall)} iconBg="#eff6ff" iconColor="#2563eb" />
          <SummaryCard icon={TrendingUp}   label="Paid"           value={loading ? "…" : `${totalPaid} / ${total}`}      iconBg="#dcfce7" iconColor="#16a34a" />
          <SummaryCard icon={TrendingDown} label="Unpaid"         value={loading ? "…" : `${totalUnpaid} / ${total}`}    iconBg="#fee2e2" iconColor="#dc2626" />
        </div>

        {/* Table */}
        <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#F8E0F8", height: "48px" }}>
                <th style={{ ...thStyle, paddingLeft: "20px", width: "28%" }}>Name</th>
                <th style={{ ...thStyle, width: "22%" }}>Month</th>
                <th style={{ ...thStyle, width: "20%" }}>Amount</th>
                <th style={{ ...thStyle, width: "16%" }}>Status</th>
                <th style={{ ...thStyle, width: "14%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && <LoadingRow cols={5} />}
              {!loading && error && (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#dc2626", fontSize: "14px" }}>{error}</td></tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>No salary records found.</td></tr>
              )}
              {!loading && !error && filtered.map(s => (
                <SalaryRow key={s.id} salary={s} onUpdate={updated =>
                  setSalaries(prev => prev.map(x => x.id === updated.id ? updated : x))
                } />
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}