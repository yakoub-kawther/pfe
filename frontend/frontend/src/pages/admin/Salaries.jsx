import React, { useState, useEffect, useCallback } from "react";
import Sidebar, { SIDEBAR_W } from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar";
import Searchbar from "../../components/Searchbar";
import Tabs from "../../components/Tabs";
import SalariesTable from "../../components/SalariesTable";
import { apiFetch } from "../../services/api";
import { Wallet, CheckCircle2, Clock, Users, GraduationCap } from "lucide-react";

const tabs = [
  { name: "payment", path: "/Fees" },
  { name: "Salaries", path: "/Salaries" },
];

const STATUS_OPTIONS = ["pending", "paid"];
const CURRENT_YEAR = new Date().getFullYear();

const inp = {
  width: "100%",
  border: "1px solid #e2d0e2",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "14px",
  color: "#701366",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#fff",
};
const sel = { ...inp, cursor: "pointer" };

const Field = ({ label, children, full = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...(full ? { gridColumn: "1 / -1" } : {}) }}>
    {label && <label style={{ fontSize: "13px", color: "#6b7280", fontFamily: "Inter, sans-serif" }}>{label}</label>}
    {children}
  </div>
);

const SummaryCard = ({ icon, label, value, color }) => (
  <div
    style={{
      flex: 1,
      minWidth: "160px",
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }}
  >
    <div
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        background: `${color}1a`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: "13px", color: "#701366", opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: 700, color: "#701366" }}>{value}</div>
    </div>
  </div>
);

const SalariesPage = () => {
  const [search, setSearch]         = useState("");
  const [position, setPosition]     = useState("All");
  const [positions, setPositions]   = useState([]);
  const [year, setYear]             = useState(CURRENT_YEAR);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selected,    setSelected]    = useState(null);
  const [modalAmount, setModalAmount] = useState("");
  const [modalStatus, setModalStatus] = useState("pending");
  const [modalRemark, setModalRemark] = useState("");
  const [modalBusy,   setModalBusy]   = useState(false);
  const [notifying,   setNotifying]   = useState(false);
  const [modalError,  setModalError]  = useState(null);
  const [notice,      setNotice]      = useState(null);

  // Salary records are one row per employee per month — NOT one row per
  // staff member. So counts here are deduplicated by employee id where
  // "staff/teacher count" is meant, and left as raw record counts where
  // "paid/pending" is meant (i.e. how many payments, not how many people).
  const [allSalaries, setAllSalaries] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [teacherIds, setTeacherIds]   = useState(new Set());

  useEffect(() => {
    apiFetch("/academic/positions/")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results ?? [];
        setPositions(["Teacher", ...list.map((p) => p.name)]);
      })
      .catch(() => setPositions(["Teacher"]));
  }, []);

  useEffect(() => {
    apiFetch("/persons/teachers/")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results ?? [];
        const ids = new Set(list.map((t) => t.employee?.person_id));
        setTeacherIds(ids);
      })
      .catch(() => setTeacherIds(new Set()));
  }, []);

  const fetchAllForSummary = useCallback(async () => {
    try {
      const res = await apiFetch(`/salaries/?year=${year}`);
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results ?? [];
      setAllSalaries(list);
      setTotalAmount(Number(data.total_amount ?? 0));
    } catch {
      // summary is a nice-to-have; SalariesTable's own error state covers real failures
    }
  }, [year]);

  useEffect(() => {
    fetchAllForSummary();
  }, [fetchAllForSummary, refreshKey]);

  const openModal = (record) => {
    setSelected(record);
    setModalAmount(record.amount ?? "");
    setModalStatus(record.status ?? "pending");
    setModalRemark(record.remark ?? "");
    setModalError(null);
    setNotice(null);
  };

  const closeModal = () => {
    setSelected(null);
    setModalError(null);
    setNotice(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setModalBusy(true);
    setModalError(null);
    setNotice(null);
    try {
      const res = await apiFetch(`/salaries/upsert/`, {
        method: "PATCH",
        body: {
          employee: selected.employee_id ?? selected.employee,
          month: selected.month_num ?? selected.month,
          year: selected.year,
          amount: modalAmount,
          status: modalStatus,
          remark: modalRemark,
        },
      });
      if (!res.ok) throw new Error("Failed to save salary.");
      setRefreshKey((k) => k + 1);
      setNotice("Saved.");
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
    }
  };

  // Independent of Save — sending a notification about an already-correct
  // record shouldn't require a no-op save first.
  const handleNotify = async () => {
    if (!selected) return;
    setNotifying(true);
    setModalError(null);
    setNotice(null);
    try {
      const res = await apiFetch(`/salaries/${selected.id}/notify/`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send notification.");
      setNotice("Notification sent.");
    } catch (err) {
      setModalError(err.message);
    } finally {
      setNotifying(false);
    }
  };

  // Unique staff appearing in this year's salary records (dedupe by
  // employee id, since each person has one row per month).
  const uniqueEmployeeIds = new Set(allSalaries.map((s) => s.employee));
  const totalStaff = uniqueEmployeeIds.size;

  const teacherCount = new Set(
    allSalaries.filter((s) => teacherIds.has(s.employee)).map((s) => s.employee)
  ).size;

  // Paid/Pending here count PAYMENT RECORDS (one per employee per month),
  // not distinct people — e.g. one teacher paid for 5 months shows as 5.
  // const paidCount    = allSalaries.filter((s) => (s.status ?? "").toLowerCase() === "paid").length;
  // const pendingCount = allSalaries.filter((s) => (s.status ?? "").toLowerCase() === "pending").length;
  // const totalRecords = allSalaries.length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#faf7fb" }}>
      <Sidebar />

      <div style={{ marginLeft: SIDEBAR_W, flex: 1, padding: "0 32px 32px", boxSizing: "border-box" }}>
        <Navbar />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={() => setYear((y) => y - 1)}
            aria-label="Previous year"
            style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #701366", background: "white", color: "#701366", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ‹
          </button>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#701366", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {year} Payment
          </h1>
          <button
            onClick={() => setYear((y) => y + 1)}
            aria-label="Next year"
            style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #701366", background: "white", color: "#701366", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ›
          </button>
        </div>

        {/* Summary */}
        <section style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
          <SummaryCard icon={<Users size={22} />} label="Total Staff" value={totalStaff} color="#701366" />
          <SummaryCard icon={<GraduationCap size={22} />} label="Total Teachers" value={teacherCount} color="#7c3aed" />
          <SummaryCard icon={<Wallet size={22} />} label="Total Salaries" value={`${totalAmount.toLocaleString()} DA`} color="#2563eb" />
          {/* <SummaryCard icon={<CheckCircle2 size={22} />} label="Paid" value={`${paidCount} / ${totalRecords}`} color="#1a7f4b" />
          <SummaryCard icon={<Clock size={22} />} label="Pending" value={`${pendingCount} / ${totalRecords}`} color="#b58a00" /> */}
        </section>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <Tabs tabs={tabs} />
          <Searchbar
            placeholder="Search by name"
            filterOptions={positions}
            showAdd={false}
            onSearchChange={setSearch}
            onFilterChange={setPosition}
          />
        </div>

        <SalariesTable key={refreshKey} search={search} position={position} year={year} onSelectRecord={openModal} />
      </div>

      {/* ── MODAL ── */}
      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
          onClick={closeModal}
        >
          <div
            style={{ background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 8px 40px rgba(112,19,102,0.18)", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", margin: 0 }}>Salary record</h3>
              <button
                onClick={closeModal}
                style={{ border: "none", background: "none", color: "#701366", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "#b48ab0", margin: "0 0 20px" }}>
              {selected.full_name ?? selected.employee_name} — {selected.position} · {selected.month} {selected.year}
            </p>

            {modalError && (
              <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c", fontSize: "13px", border: "1px solid #fecaca", marginBottom: "16px" }}>
                {modalError}
              </div>
            )}
            {notice && !modalError && (
              <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#e6f7ec", color: "#1a7f4b", fontSize: "13px", border: "1px solid #b7e3c6", marginBottom: "16px" }}>
                {notice}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <Field label="Amount (DA)">
                <input
                  type="number"
                  style={inp}
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                />
              </Field>

              <Field label="Status">
                <select style={sel} value={modalStatus} onChange={(e) => setModalStatus(e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </Field>

              <Field label="Remark" full>
                <textarea
                  value={modalRemark}
                  onChange={(e) => setModalRemark(e.target.value)}
                  placeholder="Enter a remark..."
                  style={{ ...inp, height: "70px", resize: "none" }}
                />
              </Field>
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                onClick={handleNotify}
                disabled={notifying}
                style={{ padding: "8px 20px", borderRadius: "8px", border: "1.5px solid #701366", background: "#fff", color: "#701366", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: notifying ? "not-allowed" : "pointer", fontWeight: 600, opacity: notifying ? 0.6 : 1 }}
              >
                {notifying ? "Sending..." : "Send Notification"}
              </button>
              <button
                onClick={handleSave}
                disabled={modalBusy}
                style={{ padding: "8px 24px", borderRadius: "8px", border: "1.5px solid #701366", background: modalBusy ? "#a855a0" : "#701366", color: "#fff", fontSize: "13px", fontFamily: "Inter, sans-serif", cursor: modalBusy ? "not-allowed" : "pointer", fontWeight: 600 }}
              >
                {modalBusy ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalariesPage;