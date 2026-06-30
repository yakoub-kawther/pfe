import React, { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import Tabs from "../../components/Tabs";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../services/api";
import { Loader2 } from "lucide-react";

const statusStyles = {
  paid:      { background: "#dcfce7", color: "#16a34a" },
  pending:   { background: "#fef9c3", color: "#ca8a04" },
  confirmed: { background: "#dcfce7", color: "#16a34a" },
  overdue:   { background: "#fee2e2", color: "#dc2626" },
  cancelled: { background: "#fee2e2", color: "#dc2626" },
};

const getStatusStyle = (s = "") => statusStyles[s.toLowerCase()] ?? statusStyles.pending;

const fmt = (label) =>
  label ? label.charAt(0).toUpperCase() + label.slice(1) : "—";

// Extract level code (A1, B2, etc.) from level_name string
const extractLevel = (name = "") => {
  const m = name.match(/\b([ABC][12])\b/i);
  return m ? m[1].toUpperCase() : name || "—";
};

export default function Payment_student() {
  const { state } = useLocation();
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
    console.log("fetching URL:", `/payments/student/${student?.person?.id}/`);
    if (!studentId) { setLoading(false); return; }
    const load = async () => {
      try {
        const res = await apiFetch(`/payments/student/${studentId}/`);
        console.log("status:", res.status);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        console.log("data:", JSON.stringify(data).slice(0, 300));
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
      // Optionally update amount first via PATCH if changed
      // const res = await apiFetch(`/payments/${selected.id}/confirm/`, { method: "PATCH" });
      // Confirm the payment
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
      <div className="flex flex-col gap-6">

        {/* TITLE */}
        <h2 className="text-2xl font-Inter text-[#701366]">All Payments</h2>

        {/* TABS */}
        <Tabs tabs={studentTabs} />

        {/* MAIN CONTENT */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* TABLE */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: "420px" }}>
                <thead>
                  <tr className="bg-[#F8E0F8] h-12 text-[#701366] text-left">
                    <th className="py-3 whitespace-nowrap" style={{ paddingLeft: "30px" }}>Language</th>
                    <th className="px-4 py-3 whitespace-nowrap">Class</th>
                    <th className="px-4 py-3 whitespace-nowrap">Level</th>
                    <th className="px-4 py-3 whitespace-nowrap">Amount</th>
                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f8e0f8]">

                  {loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2 text-[#701366] opacity-60">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!loading && error && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-red-500 text-sm">{error}</td>
                    </tr>
                  )}

                  {!loading && !error && payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-[#701366] opacity-50 text-sm">No payments found.</td>
                    </tr>
                  )}

                  {!loading && !error && payments.map((p) => {
                    const isPending = ["pending", "overdue"].includes(p.status?.toLowerCase());
                    const language  = p.level_name ?? p.inscription?.enrolled_class?.language ?? "—";
                    const className = p.class_name ?? p.inscription?.enrolled_class?.name ?? "—";
                    const level     = extractLevel(p.level_name ?? "");
                    const style     = getStatusStyle(p.status);

                    return (
                      <tr
                        key={p.id}
                        onClick={() => openModal(p)}
                        className="transition-colors h-12"
                        style={{
                          cursor: isPending ? "pointer" : "default",
                          background: "white",
                        }}
                        onMouseEnter={e => { if (isPending) e.currentTarget.style.background = "#fffafe"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "white"; }}
                        title={isPending ? "Click to update payment" : ""}
                      >
                        <td className="py-3 text-[#701366] whitespace-nowrap" style={{ paddingLeft: "30px" }}>
                          {language}
                        </td>
                        <td className="px-4 py-3 text-[#701366] whitespace-nowrap">{className}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span style={{ background: "#f0f9ff", color: "#0369a1", padding: "3px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                            {level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#701366] whitespace-nowrap font-medium">
                          {p.amount ? `${Number(p.amount).toLocaleString("fr-DZ")} DA` : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 500, ...style }}>
                            ● {fmt(p.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* DONUT */}
          <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center">
            <h3 className="text-[#701366] font-Inter text-xl mb-4">Payments Rate</h3>
            <div className="flex gap-4 text-xs mb-4">
              <div className="flex items-center gap-1 text-[#f2c94c]">
                <span className="w-2 h-2 bg-[#f2c94c] rounded-full"></span> Unpaid
              </div>
              <div className="flex items-center gap-1 text-[#701366]">
                <span className="w-2 h-2 bg-[#701366] rounded-full"></span> Paid
              </div>
            </div>
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={radius} stroke="#eee" strokeWidth={stroke} fill="none" />
                <circle cx="75" cy="75" r={radius} stroke="#701366" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" transform="rotate(-90 75 75)" />
                <circle cx="75" cy="75" r={radius} stroke="#fde68a" strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - ((100 - percent) / 100) * circumference}
                  strokeLinecap="round" transform={`rotate(${(percent / 100) * 360 - 90} 75 75)`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-Inter text-[#701366]">{percent}%</span>
              </div>
            </div>
            {!loading && (
              <p className="text-xs text-[#b48ab0] mt-4">{paid} of {total} payments confirmed</p>
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
              Inscription #{selected.inscription_id ?? selected.id} — {selected.level_name ?? ""}
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