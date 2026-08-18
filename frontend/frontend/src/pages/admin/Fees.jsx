import React, { useState } from "react";
import Sidebar, { SIDEBAR_W } from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar";
import Searchbar from "../../components/Searchbar";
import Tabs from "../../components/Tabs";
import FeesTable from "../../components/FeesTable";
import { apiFetch } from "../../services/api";

const tabs = [
  { name: "payment", path: "/Fees" },
  { name: "Salaries", path: "/Salaries" },
];

const STATUS_OPTIONS = ["pending", "paid", "overdue"];

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

const FeesPage = () => {
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);

  const [selected,    setSelected]    = useState(null);
  const [modalAmount, setModalAmount] = useState("");
  const [modalStatus, setModalStatus] = useState("pending");
  const [modalRemark, setModalRemark] = useState("");
  const [modalBusy,   setModalBusy]   = useState(false);
  const [notifying,   setNotifying]   = useState(false);
  const [modalError,  setModalError]  = useState(null);
  const [notice,      setNotice]      = useState(null);

  const openModal = (payment) => {
    setSelected(payment);
    setModalAmount(payment.amount ?? "");
    setModalStatus(payment.status ?? "pending");
    setModalRemark(payment.remark ?? "");
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
      const res = await apiFetch(`/payments/${selected.id}/`, {
        method: "PATCH",
        body: { amount: modalAmount, status: modalStatus, remark: modalRemark },
      });
      if (!res.ok) throw new Error("Failed to save payment.");
      setRefreshKey((k) => k + 1);
      setNotice("Saved.");
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
    }
  };

  // Independent of Save now — you shouldn't have to save a no-op change
  // just to unlock sending a notification about an already-correct record.
  const handleNotify = async () => {
    if (!selected) return;
    setNotifying(true);
    setModalError(null);
    setNotice(null);
    try {
      const res = await apiFetch(`/payments/${selected.id}/notify/`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send notification.");
      setNotice("Notification sent.");
    } catch (err) {
      setModalError(err.message);
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#faf7fb" }}>
      <Sidebar />

      <div style={{ marginLeft: SIDEBAR_W, flex: 1, padding: "0 32px 32px", boxSizing: "border-box" }}>
        <Navbar />

        {/* Header — resized/restyled to match Classes.jsx */}
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{  fontSize: "32px",
            fontWeight: 700,
            color: "#701366",
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.2, }}>
            Students payment
          </h1>
          <p style={{ fontSize: "14px", color: "#701366", opacity: 0.55, margin: "4px 0 0" }}>
            Track and manage student fee payments
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <Tabs tabs={tabs} />
          <Searchbar
            placeholder="Search by name"
            filterOptions={["Paid", "Pending", "Overdue"]}
            showAdd={false}
            onSearchChange={setSearch}
            onFilterChange={setStatus}
          />
        </div>

        <FeesTable key={refreshKey} search={search} status={status} onSelectRecord={openModal} />
      </div>

      {/* ── MODAL — restyled to match the Add/Edit Class modal ── */}
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
              <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", margin: 0 }}>Fee record</h3>
              <button
                onClick={closeModal}
                style={{ border: "none", background: "none", color: "#701366", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "#b48ab0", margin: "0 0 20px" }}>
              {selected.student_name} — {selected.language} · {selected.class_name}
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
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

export default FeesPage;