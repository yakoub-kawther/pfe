import React from "react";
import { X, Printer } from "lucide-react";
import { apiFetch } from "../services/api";

const row = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f5eef5" };
const rowLabel = { fontSize: "13px", color: "#9b7a9b" };
const rowValue = { fontSize: "13px", color: "#2a2a2a", fontWeight: 500 };

const STATUS_LABEL = { paid: "Paid", pending: "Pending", overdue: "Overdue" };

/**
 * Read-only receipt popup, shown when a status pill in FeesTable is clicked.
 * `record` is the flat payment row: { id, student_name, language, class_name,
 * amount, status, payment_date, remark }
 */
const PaymentReceiptModal = ({ record, onClose, onUpdate }) => {
  if (!record) return null;

  const handleNotify = () => {
    apiFetch(`/payments/${record.id}/notify/`, { method: "POST" }).catch(() => {});
  };

  const receiptNumber = `#${String(record.id).padStart(6, "0")}`;
  const formattedDate = record.payment_date
    ? new Date(record.payment_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-print, #receipt-print * { visibility: visible; }
          #receipt-print { position: absolute; top: 0; left: 0; width: 100%; }
          #receipt-actions { display: none !important; }
        }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)",
          zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div
          id="receipt-print"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "380px", background: "white", borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontFamily: "Inter, sans-serif",
            padding: "28px 28px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", color: "#b48ab0" }}>Receipt {receiptNumber}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#701366" }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ height: "2px", width: "60px", background: "#701366", margin: "8px 0 18px" }} />

          <div style={row}>
            <span style={rowLabel}>Full Name</span>
            <span style={rowValue}>{record.student_name}</span>
          </div>
          <div style={row}>
            <span style={rowLabel}>Language</span>
            <span style={rowValue}>{record.language}</span>
          </div>
          <div style={row}>
            <span style={rowLabel}>Class</span>
            <span style={rowValue}>{record.class_name}</span>
          </div>
          <div style={row}>
            <span style={rowLabel}>Fee</span>
            <span style={rowValue}>{record.amount} DA</span>
          </div>
          <div style={row}>
            <span style={rowLabel}>Payment Date</span>
            <span style={rowValue}>{formattedDate}</span>
          </div>
          <div style={row}>
            <span style={rowLabel}>Status</span>
            <span style={rowValue}>{STATUS_LABEL[record.status] || record.status}</span>
          </div>
          <div style={{ padding: "10px 0" }}>
            <span style={rowLabel}>Remarks</span>
            <p style={{ fontSize: "13px", color: "#2a2a2a", margin: "6px 0 0" }}>
              {record.remark || "—"}
            </p>
          </div>

          <div id="receipt-actions" style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
            <button
              onClick={onUpdate}
              style={{ flex: 1, height: "36px", borderRadius: "8px", border: "none", background: "#701366", color: "#fff", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
            >
              Update
            </button>
            <button
              onClick={handleNotify}
              style={{ flex: 1, height: "36px", borderRadius: "8px", border: "1px solid #701366", background: "#fff", color: "#701366", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
            >
              Send as Notification
            </button>
            <button
              onClick={() => window.print()}
              aria-label="Print receipt"
              style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid #e2d0e2", background: "#faf5fa", color: "#701366", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <Printer size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentReceiptModal;