import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import { apiFetch } from "../../services/api";

const F = "Inter, sans-serif";

const thStyle = {
  padding   : "12px 16px",
  fontSize  : "14px",
  fontWeight: 500,
  textAlign : "center",
  whiteSpace: "nowrap",
  color     : "#701366",
  fontFamily: F,
};

const tdStyle = {
  padding   : "12px 16px",
  fontSize  : "14px",
  color     : "#701366",
  whiteSpace: "nowrap",
  textAlign : "center",
  fontFamily: F,
};

const statusStyle = (status) => {
  const s = (status ?? "").toLowerCase();
  let background = "#fdecea";
  let color      = "#c92c2c";
  if (["paid", "confirmed"].includes(s)) {
    background = "#e6f7ec";
    color      = "#1a7f4b";
  } else if (s === "pending") {
    background = "#fef9c3";
    color      = "#ca8a04";
  }
  return {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
    background,
    color,
    textTransform: "capitalize",
  };
};

const backBtnStyle = {
  width: "36px", height: "32px", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "8px", cursor: "pointer",
  border: "1px solid #701366", transition: "background 0.15s, color 0.15s",
  background: "white", color: "#701366",
};

const fmt = (label) =>
  label ? label.charAt(0).toUpperCase() + label.slice(1) : "—";

export default function Payment_student() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const student = state?.student;

  const studentTabs = [
    { name: "Profile",    path: "/Student_profile",    state: { student } },
    { name: "Classes",    path: "/Student_classes",    state: { student } },
    { name: "Payment",    path: "/Payment_student",    state: { student } },
    { name: "Attendance", path: "/Attendance_student", state: { student } },
  ];

  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // Modal state
  const [selected,     setSelected]     = useState(null); // payment object
  const [modalAmount,  setModalAmount]  = useState("");
  const [modalBusy,    setModalBusy]    = useState(false);
  const [modalError,   setModalError]   = useState(null);

  useEffect(() => {
    const studentId = student?.person?.id ?? student?.id;
    if (!studentId) { setLoading(false); return; }
    const load = async () => {
      try {
        const res = await apiFetch(`/payments/student/${studentId}/`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load payments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [student?.person?.id ?? student?.id]);

  // Donut chart stats
  const total   = payments.length;
  const paid    = payments.filter(p => ["paid", "confirmed"].includes(p.status?.toLowerCase())).length;
  const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
  const radius       = 60;
  const stroke       = 12;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (percent / 100) * circumference;

  // ── Modal: confirm payment ──────────────────────────────────
  const openModal = (payment) => {
    const isPending = ["pending", "overdue"].includes(payment.status?.toLowerCase());
    if (!isPending) return; // only pending rows are clickable
    setSelected(payment);
    setModalAmount(payment.amount ?? "");
    setModalError(null);
  };

  const closeModal = () => {
    setSelected(null);
    setModalAmount("");
    setModalError(null);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setModalBusy(true);
    setModalError(null);
    try {
      const res = await apiFetch(`/payments/${selected.id}/confirm/`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to confirm payment.");
      const updated = await res.json();
      setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
      closeModal();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!selected) return;
    setModalBusy(true);
    setModalError(null);
    try {
      const res = await apiFetch(`/payments/${selected.id}/cancel/`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to cancel payment.");
      setPayments(prev => prev.filter(p => p.id !== selected.id));
      closeModal();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", minWidth: 0, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "14px", direction: "ltr" }}>
          <button
            onClick={() => navigate("/Students")}
            style={backBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white";   e.currentTarget.style.color = "#701366"; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#701366",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Payments
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", width: "100%", flexShrink: 0, minWidth: 0 }}>
          <Tabs tabs={studentTabs} />
        </div>

        {/* MAIN CONTENT */}
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>

          {/* TABLE */}
          <div style={{ flex: 2, minWidth: "320px", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", boxSizing: "border-box" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "#F8E0F8", height: "48px" }}>
                  <th style={{ ...thStyle, width: "22%" }}>Language</th>
                  <th style={{ ...thStyle, width: "22%" }}>Class</th>
                  <th style={{ ...thStyle, width: "16%" }}>Level</th>
                  <th style={{ ...thStyle, width: "20%" }}>Amount</th>
                  <th style={{ ...thStyle, width: "20%" }}>Status</th>
                </tr>
              </thead>
              <tbody>

                {loading && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "32px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#701366", opacity: 0.6 }}>
                        <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                        <span style={{ fontSize: "14px" }}>Loading...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#dc2626", fontSize: "14px" }}>{error}</td>
                  </tr>
                )}

                {!loading && !error && payments.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5, fontSize: "14px" }}>No payments found.</td>
                  </tr>
                )}

                {!loading && !error && payments.map((p) => {
                  const isPending = ["pending", "overdue"].includes(p.status?.toLowerCase());
                  const language  = p.language   ?? "—";
                  const className = p.class_name ?? "—";
                  const level     = p.level      ?? "—";

                  return (
                    <tr
                      key={p.id}
                      onClick={() => openModal(p)}
                      style={{
                        height: "48px",
                        borderBottom: "1px solid #f8e0f8",
                        transition: "background 0.1s",
                        cursor: isPending ? "pointer" : "default",
                        background: "white",
                      }}
                      onMouseEnter={e => { if (isPending) e.currentTarget.style.background = "#fffafe"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
                      title={isPending ? "Click to update payment" : ""}
                    >
                      <td style={tdStyle}>{language}</td>
                      <td style={tdStyle}>{className}</td>
                      <td style={tdStyle}>
                        <span style={{   padding: "3px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                          {level}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>
                        {p.amount ? `${Number(p.amount).toLocaleString("fr-DZ")} DA` : "—"}
                      </td>
                      <td style={tdStyle}>
                        <span style={statusStyle(p.status)}>
                          {fmt(p.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* DONUT */}
          <div style={{ flex: 1, minWidth: "260px", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
            <h3 style={{ fontSize: "19px", fontWeight: 700, color: "#701366", marginBottom: "16px", flexShrink: 0, fontFamily: F }}>Payments Rate</h3>
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
                  strokeLinecap="round" transform={`rotate(${(percent / 100) * 360 - 90} 75 75)`} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#701366" }}>{percent}%</span>
              </div>
            </div>
            {!loading && (
              <p style={{ fontSize: "12px", color: "#b48ab0", marginTop: "16px" }}>{paid} of {total} payments confirmed</p>
            )}
          </div>

        </div>
      </div>

      {/* ── MODAL ─────────────────────────────────────────────── */}
      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={closeModal}
        >
          <div
            style={{ background: "white", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "420px", boxShadow: "0 8px 40px rgba(112,19,102,0.18)", fontFamily: "Inter, sans-serif" }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "18px", color: "#701366", margin: "0 0 6px" }}>Update Payment</h3>
            <p style={{ fontSize: "13px", color: "#b48ab0", margin: "0 0 24px" }}>
              Inscription #{selected.inscription_id ?? selected.id} — {selected.class_name ?? ""}
            </p>

            {/* Amount field */}
            <label style={{ fontSize: "13px", color: "#701366", fontWeight: 500, display: "block", marginBottom: "6px" }}>
              Amount (DA)
            </label>
            <input
              type="number"
              value={modalAmount}
              onChange={e => setModalAmount(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #f8e0f8", fontSize: "14px", color: "#701366", outline: "none", boxSizing: "border-box", marginBottom: "20px" }}
              onFocus={e => e.target.style.borderColor = "#701366"}
              onBlur={e => e.target.style.borderColor = "#f8e0f8"}
            />

            {modalError && (
              <p style={{ fontSize: "13px", color: "#dc2626", marginBottom: "16px" }}>{modalError}</p>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleConfirm}
                disabled={modalBusy}
                style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: "#701366", color: "white", fontSize: "14px", fontWeight: 600, cursor: modalBusy ? "not-allowed" : "pointer", opacity: modalBusy ? 0.7 : 1 }}
              >
                {modalBusy ? "…" : "Confirm Payment"}
              </button>
              <button
                onClick={handleCancel}
                disabled={modalBusy}
                style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: "#fee2e2", color: "#dc2626", fontSize: "14px", fontWeight: 600, cursor: modalBusy ? "not-allowed" : "pointer", opacity: modalBusy ? 0.7 : 1 }}
              >
                {modalBusy ? "…" : "Cancel Payment"}
              </button>
            </div>

            <button
              onClick={closeModal}
              style={{ width: "100%", marginTop: "10px", padding: "10px", borderRadius: "10px", border: "1.5px solid #f8e0f8", background: "white", color: "#701366", fontSize: "14px", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}