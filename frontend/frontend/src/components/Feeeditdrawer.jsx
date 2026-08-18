import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../services/api";

const STATUS_OPTIONS = ["pending", "paid", "overdue"];

const label = { fontSize: "12px", color: "#9b7a9b", display: "block", marginBottom: "5px" };
const field = {
  width: "100%", boxSizing: "border-box", borderRadius: "8px",
  border: "1px solid #e2d0e2", padding: "9px 12px", fontSize: "13px",
  color: "#701366", background: "#faf5fa", fontFamily: "Inter, sans-serif", outline: "none",
};

const btnBase = {
  height: "32px", borderRadius: "12px", fontSize: "13px", fontWeight: 500,
  cursor: "pointer", border: "1px solid #701366", padding: "0 16px",
  transition: "background 0.15s, color 0.15s",
};
const btnOutline = { ...btnBase, background: "white", color: "#701366" };
const btnFilled  = { ...btnBase, background: "#701366", color: "white" };

/**
 * `record` is whatever FeesTable/PaymentReceiptModal passes:
 * { id, level, status, student_name, language, class_name, amount, remark }
 * Only Amount, Status and Remark are editable — student, language and
 * class are shown as read-only context so nothing can be edited by accident.
 * Rendered as a centered popup, matching PaymentReceiptModal's style.
 */
const FeeEditDrawer = ({ record, onClose, onSaved }) => {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("pending");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false); // gates the "Send as notification" button

  useEffect(() => {
    if (!record) return;
    setAmount(record.amount ?? "");
    setStatus(record.status ?? "pending");
    setRemark(record.remark ?? "");
    setSaved(false);
  }, [record]);

  if (!record) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`/payments/${record.id}/`, {
        method: "PATCH",
        body: { amount, status, remark },
      });
      if (res.ok) {
        setSaved(true);
        onSaved && onSaved();
      }
    } catch {
      // TODO: surface a real error state if this matters for your workflow
    } finally {
      setSaving(false);
    }
  };

  const handleNotify = () => {
    apiFetch(`/payments/${record.id}/notify/`, { method: "POST" }).catch(() => {});
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)",
        zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "380px", background: "white", borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontFamily: "Inter, sans-serif",
          overflow: "hidden",
        }}
      >

        <div style={{ padding: "18px 20px", background: "#F8E0F8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#701366" }}>Fee record</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#701366" }}>
            <X size={18} />
          </button>
        </div>

        {/* read-only context — never editable */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0e0f0" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 4px", color: "#2a2a2a" }}>{record.student_name}</p>
          <p style={{ fontSize: "13px", color: "#701366", margin: 0 }}>
            {record.language} · {record.class_name}
          </p>
        </div>

        {/* editable fields */}
        <div style={{ padding: "18px 20px" }}>
          <label style={label}>Amount (DA)</label>
          <input style={{ ...field, marginBottom: "16px" }} value={amount} onChange={(e) => setAmount(e.target.value)} />

          <label style={label}>Status</label>
          <select style={{ ...field, marginBottom: "16px", cursor: "pointer" }} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>

          <label style={label}>Remark</label>
          <textarea
            style={{ ...field, height: "80px", resize: "none" }}
            placeholder="Enter a remark..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>

        <div style={{ padding: "16px 10px", borderTop: "1px solid #f0e0f0", display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={onClose}
            style={btnOutline}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; }}
          >
            Cancel
          </button>

          {/* <button
            onClick={handleNotify}
            disabled={!saved}
            title={saved ? "" : "Save changes first"}
            style={saved ? btnOutline : { ...btnOutline, cursor: "not-allowed", color: "#d0b0d0", borderColor: "#e8d5e8" }}
            onMouseEnter={(e) => { if (saved) { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; } }}
            onMouseLeave={(e) => { if (saved) { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; } }}
          >
            Send as notification
          </button> */}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...btnFilled, marginLeft: "auto", opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer" }}
            onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; } }}
            onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; } }}
          >
            {saving ? "Saving..." : "Save"}
          </button>



          <button
            onClick={handleNotify}
            disabled={!saved}
            title={saved ? "" : "Save changes first"}
            style={saved ? btnOutline : { ...btnOutline, cursor: "not-allowed", color: "#d0b0d0", borderColor: "#e8d5e8" }}
            onMouseEnter={(e) => { if (saved) { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; } }}
            onMouseLeave={(e) => { if (saved) { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; } }}
          >
            Send as notification
          </button>
        </div>

      </div>
    </div>
  );
};

export default FeeEditDrawer;