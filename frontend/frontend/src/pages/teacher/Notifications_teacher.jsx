import { useState } from "react";
import Teacher_layout from "../../layouts/Teacher_layout";
import { Send, X } from "lucide-react";

const NOTIFICATION_TYPES = ["Announcement", "Alert", "Information"];
const RECIPIENTS         = ["All Users", "Students", "Teachers", "Specific Class"];

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label style={{ fontSize: "14px", fontWeight: 500, color: "#701366", fontFamily: "Inter, sans-serif" }}>
      {label}
    </label>
    {children}
  </div>
);

const inputCls = {
  width: "100%", border: "1.5px solid #e2d0e2", borderRadius: "10px",
  padding: "10px 14px", fontSize: "13.5px", color: "#701366",
  fontFamily: "Inter, sans-serif", backgroundColor: "#fff",
  outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

export default function Notifications_teacher() {
  const [form, setForm] = useState({ type: "", recipients: "", title: "", message: "" });

  const focus = (e) => { e.target.style.borderColor = "#701366"; e.target.style.boxShadow = "0 0 0 3px rgba(112,19,102,0.08)"; };
  const blur  = (e) => { e.target.style.borderColor = "#e2d0e2"; e.target.style.boxShadow = "none"; };

  const handleSend = () => {
    if (!form.title && !form.message) return;
    // call API here to persist the notification
    setForm({ type: "", recipients: "", title: "", message: "" });
  };

  return (
    <Teacher_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto",fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #701366, #9c1e8e)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Send size={16} color="white" />
            </div>
            <h2 style={{ fontSize: "24px", color: "#701366", fontFamily: "Inter, sans-serif", margin: 0 }}>
              Send Notification
            </h2>
          </div>
          <p style={{ fontSize: "12px", color: "#a07aa0", fontFamily: "Inter, sans-serif", marginLeft: "46px" }}>
            Compose and send a notification to your selected audience.
          </p>
        </div>

        {/* card */}
        <div style={{
          background: "white", borderRadius: "20px", padding: "28px 32px",
          boxShadow: "0 2px 16px rgba(112,19,102,0.07)", border: "1px solid #f0e0f0",
          display: "flex", flexDirection: "column", gap: "20px",
        }}>

          {/* type + recipients */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            <Field label="Notification Type">
              <input list="notif-types" placeholder="e.g. Announcement"
                value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={inputCls} onFocus={focus} onBlur={blur} />
              <datalist id="notif-types">{NOTIFICATION_TYPES.map((t) => <option key={t} value={t} />)}</datalist>
            </Field>
            <Field label="Recipients">
              <input list="notif-recipients" placeholder="e.g. All Users"
                value={form.recipients} onChange={(e) => setForm({ ...form, recipients: e.target.value })}
                style={inputCls} onFocus={focus} onBlur={blur} />
              <datalist id="notif-recipients">{RECIPIENTS.map((r) => <option key={r} value={r} />)}</datalist>
            </Field>
          </div>

          {/* title */}
          <Field label="Title">
            <input type="text" placeholder="Enter notification title"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputCls} onFocus={focus} onBlur={blur} />
          </Field>

          {/* message */}
          <Field label="Message">
            <textarea placeholder="Write your message here…"
              value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5} style={{ ...inputCls, resize: "none", lineHeight: "1.55" }}
              onFocus={focus} onBlur={blur} />
          </Field>

          <p style={{ fontSize: "11px", color: "#c9a8c9", fontFamily: "Inter, sans-serif", marginTop: "-12px", textAlign: "right" }}>
            {form.message.length} characters
          </p>

          {/* actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "4px" }}>
            <button
              onClick={() => setForm({ type: "", recipients: "", title: "", message: "" })}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                border: "1.5px solid #e2d0e2", color: "#701366", background: "white",
                borderRadius: "10px", padding: "9px 20px", fontSize: "13px",
                fontFamily: "Inter, sans-serif", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#701366"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e2d0e2"}
            >
             Cancel
            </button>
            <button
              onClick={handleSend}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "linear-gradient(135deg, #701366, #9c1e8e)",
                color: "white", border: "none", borderRadius: "10px",
                padding: "9px 24px", fontSize: "13px",
                fontFamily: "Inter, sans-serif", cursor: "pointer", transition: "opacity 0.15s",
                boxShadow: "0 4px 12px rgba(112,19,102,0.25)",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <Send size={13} /> Send Notification
            </button>
          </div>
        </div>
      </div>
    </Teacher_layout>
  );
}