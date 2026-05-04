import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { apiFetch } from "../../services/api";

// ─── Styles ───────────────────────────────────────────────────
const PURPLE = "#701366";
const LIGHT  = "#f9f0f8";

const inp = {
  width: "100%", border: `1px solid ${PURPLE}`, borderRadius: "8px",
  padding: "10px 14px", fontSize: "14px", color: PURPLE,
  outline: "none", boxSizing: "border-box",
  fontFamily: "Inter, sans-serif", backgroundColor: "#fff",
};

const sel = { ...inp, cursor: "pointer" };

const btn = (variant = "solid") => ({
  padding: "10px 22px", borderRadius: "8px", fontSize: "14px",
  fontFamily: "Inter, sans-serif", cursor: "pointer",
  border: `1px solid ${PURPLE}`, transition: "all 0.18s",
  ...(variant === "solid"
    ? { background: PURPLE, color: "#fff" }
    : { background: "#fff", color: PURPLE }),
});

// ─── Sub-components ───────────────────────────────────────────
const Avatar = ({ initials, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: "#f8e0f8", color: "#701366",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.35, fontWeight: 600,
    fontFamily: "Inter, sans-serif", flexShrink: 0,
  }}>
    {initials}
  </div>
);

const Badge = ({ status }) => {
  const colors = {
    confirmed: { bg: "#edfaf3", color: "#15803d" },
    cancelled: { bg: "#fef2f2", color: "#dc2626" },
    promoted:  { bg: "#eff6ff", color: "#2563eb" },
    repeated:  { bg: "#fef9c3", color: "#854d0e" },
  };
  const c = colors[status?.toLowerCase()] || colors.confirmed;
  return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, background: c.bg, color: c.color }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "13px", color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>{label}</label>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────
export default function Inscriptions() {
  // students is a list of student objects from API
  const [students,  setStudents]  = useState([]);
  // selected is the person_id (number) of the chosen student
  const [selected,  setSelected]  = useState("");

  // Classes
  const [classes,  setClasses]  = useState([]);
  const [classVal, setClassVal] = useState("");

  // Form state
  const [formError,  setFormError]  = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [enrolling,  setEnrolling]  = useState(false);

  // Inscriptions list
  const [inscriptions, setInscriptions] = useState([]);
  const [listLoading,  setListLoading]  = useState(false);
  const [listSearch,   setListSearch]   = useState("");
  const [listFilter,   setListFilter]   = useState("All");
  const [confirmId,    setConfirmId]    = useState(null);
  const [cancelling,   setCancelling]   = useState(null);

  // ─── Fetch students on mount ──────────────────────────────
  useEffect(() => {
  apiFetch("/persons/students/")
    .then(res => res.json())
    .then(data => {
      const list = Array.isArray(data) ? data : (data.results ?? []);
      console.log("first student:", JSON.stringify(list[0])); // ← add this
      setStudents(list);
    })
    .catch(() => {});
}, []);
  // ─── Fetch classes on mount ───────────────────────────────
  useEffect(() => {
    apiFetch("/academic/classes/")
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setClasses(list);
        if (list.length > 0) setClassVal(String(list[0].id));
      })
      .catch(() => {});
  }, []);

  // ─── Fetch inscriptions ───────────────────────────────────
  const fetchInscriptions = useCallback(async () => {
    setListLoading(true);
    try {
      const res  = await apiFetch("/inscriptions/");
      const data = await res.json();
      setInscriptions(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      // silently fail
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { fetchInscriptions(); }, [fetchInscriptions]);

  // ─── Enroll ───────────────────────────────────────────────
  const handleAdd = async () => {
    console.log("selected:", selected, "classVal:", classVal); 
    if (!selected) { setFormError("Please select a student."); return; }
    if (!classVal) { setFormError("Please select a class.");   return; }

    setEnrolling(true);
    setFormError("");
    setSuccessMsg("");

    try {
      const res = await apiFetch("/inscriptions/", {
     method: "POST",
  body: {
    student_id: Number(selected),
    class_id  : Number(classVal),
  },
      });

      if (!res.ok) {
        const err = await res.json();
        setFormError(err.detail || "Enrollment failed.");
        return;
      }

      // Build success message from students list
      const studentObj = students.find(s => String(s.person?.id) === String(selected));
      const p          = studentObj?.person ?? {};
      const className  = classes.find(c => String(c.id) === String(classVal))?.name ?? classVal;
      setSuccessMsg(`${p.first_name ?? ""} ${p.last_name ?? ""} enrolled in ${className} successfully!`);

      // Reset form
      setSelected("");
      if (classes.length > 0) setClassVal(String(classes[0].id));

      fetchInscriptions();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  // ─── Cancel ───────────────────────────────────────────────
  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      const res = await apiFetch(`/inscriptions/${id}/cancel/`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Cancel failed.");
        return;
      }
      setConfirmId(null);
      fetchInscriptions();
    } catch {
      alert("Network error.");
    } finally {
      setCancelling(null);
    }
  };

  // ─── Filtered + sorted list (newest first) ────────────────
const displayed = [...inscriptions]
  .sort((a, b) => new Date(b.inscription_date) - new Date(a.inscription_date))
  .filter((i) => {
    const fullName = i.student_name ?? "";
    const cls      = i.class_info?.name ?? "";
    const matchSearch = fullName.toLowerCase().includes(listSearch.toLowerCase()) ||
                        cls.toLowerCase().includes(listSearch.toLowerCase());
    const matchFilter = listFilter === "All" || i.status === listFilter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0 }}>

        {/* Title */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "25px", color: PURPLE, margin: 0 }}>Inscriptions</h2>
          <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "4px" }}>
            Enroll students into classes and manage their registrations.
          </p>
        </div>

        {/* ── Enroll Card ── */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "36px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 500, color: PURPLE, borderBottom: "1px solid #f0e0ee", paddingBottom: "12px", marginBottom: "24px", marginTop: 0 }}>
            New Inscription
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "20px", alignItems: "end" }}>

            {/* Student select */}
            <Field label="Student">
              <select
                style={sel}
                value={selected}
                onChange={e => { setSelected(e.target.value); setFormError(""); }}
              >
                <option value="" disabled>Select a student</option>
                {students.map(s => {
                  const p = s.person ?? {};
                 return (
                   <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </option>
                    
                  );
                })}
              </select>
            </Field>

            {/* Class select */}
            <Field label="Class">
              <select
                style={sel}
                value={classVal}
                onChange={e => { setClassVal(e.target.value); setFormError(""); }}
              >
                <option value="" disabled>Select a class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>

            {/* Enroll button */}
            <button
              style={{ ...btn("solid"), opacity: enrolling ? 0.7 : 1, cursor: enrolling ? "not-allowed" : "pointer" }}
              onClick={handleAdd}
              disabled={enrolling}
              onMouseEnter={e => { if (!enrolling) e.currentTarget.style.background = "#5a0f52"; }}
              onMouseLeave={e => { if (!enrolling) e.currentTarget.style.background = PURPLE; }}
            >
              {enrolling ? "Enrolling..." : "+ Enroll"}
            </button>
          </div>

          {formError && (
            <div style={{ marginTop: "14px", padding: "10px 14px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "13px" }}>
              ⚠ {formError}
            </div>
          )}
          {successMsg && (
            <div style={{ marginTop: "14px", padding: "10px 14px", background: "#edfaf3", color: "#15803d", borderRadius: "8px", fontSize: "13px" }}>
              ✓ {successMsg}
            </div>
          )}
        </div>

        {/* ── Inscriptions List ── */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "28px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #f0e0ee", paddingBottom: "16px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 500, color: PURPLE, margin: 0 }}>
              All Inscriptions
              <span style={{ marginLeft: "8px", fontSize: "13px", color: "#9ca3af", fontWeight: 400 }}>({displayed.length})</span>
            </h3>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                style={{ ...inp, width: "200px" }}
                placeholder="Search name or class..."
                value={listSearch}
                onChange={e => setListSearch(e.target.value)}
              />
              <select style={{ ...sel, width: "140px" }} value={listFilter} onChange={e => setListFilter(e.target.value)}>
                <option>All</option>
                <option>Confirmed</option>
                <option>Cancelled</option>
                <option>Promoted</option>
                <option>Repeated</option>
              </select>
            </div>
          </div>

          {listLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>Loading...</div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>No inscriptions found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {["Student", "Class", "Date", "Status", "Action"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#9ca3af", fontWeight: 500, fontSize: "13px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((ins, idx) => {
                   // Inside displayed.map((ins, idx) => {
                     const fullName = ins.student_name ?? "—";
                     const initials = fullName.split(" ").map(w => w[0] ?? "").join("").toUpperCase();
                     const cls      = ins.class_info?.name ?? "—";

                    return (
                      <tr
                        key={ins.id}
                        style={{ borderBottom: idx < displayed.length - 1 ? "1px solid #f9f9f9" : "none", transition: "background 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fdf8fc"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Avatar initials={initials || "?"} size={30} />
                            <span style={{ color: PURPLE }}>{fullName || "—"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: LIGHT, color: PURPLE, padding: "3px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: 500 }}>{cls}</span>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#6b7280" }}>
                          {ins.inscription_date
                            ? new Date(ins.inscription_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <Badge status={ins.status} />
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {ins.status === "confirmed" ? (
                            confirmId === ins.id ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "12px", color: "#6b7280" }}>Confirm?</span>
                                <button
                                  onClick={() => handleCancel(ins.id)}
                                  disabled={cancelling === ins.id}
                                  style={{ ...btn("solid"), padding: "5px 12px", fontSize: "12px", background: "#dc2626", borderColor: "#dc2626", opacity: cancelling === ins.id ? 0.7 : 1 }}
                                >
                                  {cancelling === ins.id ? "..." : "Yes"}
                                </button>
                                <button onClick={() => setConfirmId(null)} style={{ ...btn("outline"), padding: "5px 12px", fontSize: "12px" }}>No</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmId(ins.id)}
                                style={{ ...btn("outline"), padding: "6px 14px", fontSize: "12px" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#dc2626"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.color = PURPLE; }}
                              >
                                Cancel
                              </button>
                            )
                          ) : (
                            <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}