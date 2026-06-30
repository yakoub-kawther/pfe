import { useNavigate } from "react-router-dom";
import Student_layout from "../../layouts/Student_layout";
import { Bell, BookOpen, CreditCard, CalendarCheck, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";

const F = "Inter, sans-serif";

const card = {
  background: "white", borderRadius: "18px",
  boxShadow: "0 2px 12px rgba(112,19,102,0.07)",
  border: "1px solid #f5e0f3", boxSizing: "border-box",
};

const levelColors = {
  A1: { bg: "#e0f2fe", color: "#0369a1" },
  A2: { bg: "#dbeafe", color: "#1d4ed8" },
  B1: { bg: "#ede9fe", color: "#7c3aed" },
  B2: { bg: "#fae8ff", color: "#a21caf" },
  C1: { bg: "#fce7f3", color: "#be185d" },
  C2: { bg: "#ffe4e6", color: "#be123c" },
};

const StatCard = ({ icon: Icon, label, value, sub, iconBg, iconColor, onClick }) => (
  <div
    onClick={onClick}
    style={{ ...card, padding: "20px 22px", display: "flex", alignItems: "center", gap: "16px", flex: "1 1 0", minWidth: 0, cursor: onClick ? "pointer" : "default", transition: "transform 0.15s, box-shadow 0.15s" }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(112,19,102,0.12)"; }}}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(112,19,102,0.07)"; }}
  >
    <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={20} strokeWidth={1.8} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: "22px", fontWeight: 500, color: "#1a1a2e", lineHeight: 1, fontFamily: F }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#b48ab0", marginTop: "3px", fontFamily: F }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: iconColor, marginTop: "2px", fontWeight: 600, fontFamily: F }}>{sub}</div>}
    </div>
  </div>
);

export default function Dashboard_student() {
  const navigate = useNavigate();

  const [account,        setAccount]        = useState(null);
  const [inscriptions,   setInscriptions]   = useState([]);
  const [payments,       setPayments]       = useState([]);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    // Step 1: get account info + person_id
    apiFetch("/account/me/")
      .then(r => r.json())
      .then(acc => {
        setAccount(acc);
        const personId = acc?.person_id ?? null;
        if (!personId) return;

        // Step 2: fetch all data in parallel
        return Promise.all([
          apiFetch(`/inscriptions/student/${personId}/history/`).then(r => r.json()),
          apiFetch(`/payments/student/${personId}/`).then(r => r.json()),
          apiFetch("/notifications/").then(r => r.json()),
        ]).then(([inscData, payData, notifData]) => {
          setInscriptions(Array.isArray(inscData.history) ? inscData.history : []);
          setPayments(Array.isArray(payData) ? payData : (payData.results ?? []));
          const notifList = Array.isArray(notifData) ? notifData : (notifData.results ?? []);
          setUnreadCount(notifList.filter(n => !n.is_read).length);
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Stats
  const unpaidCount = payments.filter(p => p.status === "pending" || p.status === "unpaid").length;

  // Attendance across all classes
  const fullName = account?.full_name ?? "Student";

  return (
    <Student_layout>
      <div style={{ maxWidth: "1100px", margin: "32px auto", padding: "0 24px", fontFamily: F, display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Welcome Banner */}
        <div style={{ borderRadius: "20px", background: "linear-gradient(120deg, #701366 0%, #9c1e8e 60%, #b83fa8 100%)", padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: "180px", top: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", right: "80px",  top: "20px",  width: "80px",  height: "80px",  borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div>
            <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Welcome back</p>
            <h1 style={{ margin: "4px 0 10px", fontSize: "26px", fontWeight: 500, color: "white" }}>{fullName}</h1>
            <span style={{ background: "rgba(255,255,255,0.15)", color: "white", borderRadius: "9999px", padding: "4px 14px", fontSize: "12px", fontWeight: 500 }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
          <img src="/src/assets/welcomeback.svg" alt="" style={{ height: "110px", objectFit: "contain", flexShrink: 0, opacity: 0.92 }} />
        </div>

        {/* Stats Row */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <StatCard
            icon={BookOpen} label="Enrolled Classes" value={loading ? "…" : inscriptions.length}
            sub={`${inscriptions.filter(i => i.status === "confirmed").length} active`}
            iconBg="#f8e0f8" iconColor="#701366"
            onClick={() => navigate("/Classes_student")}
          />
          <StatCard
            icon={CreditCard} label="Unpaid Fees" value={loading ? "…" : unpaidCount}
            sub={unpaidCount === 0 ? "All clear!" : `${unpaidCount} payment(s) due`}
            iconBg={unpaidCount === 0 ? "#dcfce7" : "#fee2e2"}
            iconColor={unpaidCount === 0 ? "#16a34a" : "#dc2626"}
            onClick={() => navigate("/Fees_student")}
          />
          <StatCard
            icon={Bell} label="Notifications" value={loading ? "…" : unreadCount}
            sub={unreadCount > 0 ? `${unreadCount} unread` : "All read"}
            iconBg="#eff6ff" iconColor="#2563eb"
            onClick={() => navigate("/Notifications_student")}
          />
        </div>

        {/* Quick Actions */}
        <div style={{ ...card, padding: "20px 24px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 600, color: "#701366" }}>Quick Actions</h3>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "My Classes",    Icon: CalendarCheck, color: "#7c3aed", bg: "#f3f0ff", path: "/Classes_student"       },
              { label: "My Grades",     Icon: BookOpen,      color: "#701366", bg: "#f8e0f8", path: "/Notes_student"          },
              { label: "My Fees",       Icon: CreditCard,    color: "#d97706", bg: "#fffbeb", path: "/Fees_student"           },
              { label: "Notifications", Icon: Bell,          color: "#0ea5e9", bg: "#f0f9ff", path: "/Notifications_student"  },
            ].map(({ label, Icon, color, bg, path }) => (
              <button key={label} onClick={() => navigate(path)} style={{ display: "flex", alignItems: "center", gap: "8px", background: bg, border: "1.5px solid", borderColor: color + "30", borderRadius: "12px", cursor: "pointer", padding: "10px 20px", fontSize: "13px", fontWeight: 600, color, fontFamily: F, transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 14px ${color}25`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "none"; }}
              >
                <Icon size={15} strokeWidth={2} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* My Classes */}
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #faeaf9" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#701366" }}>My Classes</h3>
            <button onClick={() => navigate("/Classes_student")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px", fontSize: "12px", color: "#b48ab0", fontWeight: 500 }}>
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "24px", color: "#b48ab0", fontSize: "13px" }}>Loading...</div>
            ) : inscriptions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "#b48ab0", fontSize: "13px" }}>No classes found.</div>
            ) : inscriptions.slice(0, 4).map(ins => {
              const levelName = ins.class_info?.level ?? "";
              const lc = levelColors[levelName] ?? { bg: "#f3f4f6", color: "#374151" };
              return (
                <div
                  key={ins.id}
                  onClick={() => navigate("/Classes_student")}
                  style={{ borderRadius: "14px", border: "1.5px solid #f0e0f0", padding: "14px 16px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fdf6fd"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: lc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: lc.color }}>{levelName || "—"}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#701366" }}>{ins.class_info?.name ?? "—"}</div>
                    <div style={{ fontSize: "12px", color: "#b48ab0", marginTop: "2px" }}>
                      {ins.class_info?.language ?? "—"}
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "9999px", background: ins.status === "confirmed" ? "#dcfce7" : "#fee2e2", color: ins.status === "confirmed" ? "#16a34a" : "#dc2626" }}>
                    {ins.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </Student_layout>
  );
}