import { useState, useRef, useEffect } from "react";
import Secretary_layout from "../../layouts/Secretary_layout";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ALL_STUDENTS = [
  { id: 1, name: "Amira Benali",    phone: "0550 123 456", avatar: "AB" },
  { id: 2, name: "Yacine Moussaoui",phone: "0660 789 012", avatar: "YM" },
  { id: 3, name: "Sarah Khelifi",   phone: "0770 345 678", avatar: "SK" },
  { id: 4, name: "Omar Boudriga",   phone: "0550 901 234", avatar: "OB" },
  { id: 5, name: "Nadia Hammoudi",  phone: "0660 567 890", avatar: "NH" },
  { id: 6, name: "Karim Zerrouki",  phone: "0770 123 789", avatar: "KZ" },
];

const CLASSES = ["Eng-A1", "Eng-A2", "Eng-B1", "Eng-B2", "Eng-C1", "Eng-C2", "Fr-A1", "Fr-B1"];

const INITIAL_INSCRIPTIONS = [
  { id: 101, studentId: 1, studentName: "Amira Benali",     avatar: "AB", class: "Eng-A2", date: "2025-09-01", status: "Active" },
  { id: 102, studentId: 2, studentName: "Yacine Moussaoui", avatar: "YM", class: "Eng-B1", date: "2025-09-01", status: "Active" },
  { id: 103, studentId: 3, studentName: "Sarah Khelifi",    avatar: "SK", class: "Fr-A1",  date: "2025-10-15", status: "Active" },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const PURPLE = "#701366";
const LIGHT  = "#f9f0f8";

const inp = {
  width: "100%",
  border: `1px solid ${PURPLE}`,
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "14px",
  color: PURPLE,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#fff",
};

const sel = { ...inp, cursor: "pointer" };

const btn = (variant = "solid") => ({
  padding: "10px 22px",
  borderRadius: "8px",
  fontSize: "14px",
  fontFamily: "Inter, sans-serif",
  cursor: "pointer",
  border: `1px solid ${PURPLE}`,
  transition: "all 0.18s",
  ...(variant === "solid"
    ? { background: PURPLE, color: "#fff" }
    : { background: "#fff", color: PURPLE }),
});

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    Active:    { bg: "#edfaf3", color: "#15803d" },
    Cancelled: { bg: "#fef2f2", color: "#dc2626" },
    Completed: { bg: "#eff6ff", color: "#2563eb" },
  };
  const c = colors[status] || colors.Active;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "12px", fontWeight: 500,
      background: c.bg, color: c.color,
    }}>
      {status}
    </span>
  );
};

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "13px", color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>{label}</label>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Inscriptions_secretary() {
  // Search & dropdown
  const [query, setQuery]           = useState("");
  const [showDrop, setShowDrop]     = useState(false);
  const [selected, setSelected]     = useState(null);   // chosen student
  const dropRef                     = useRef(null);

  // Form
  const [classVal, setClassVal]     = useState(CLASSES[0]);
  const [dateVal, setDateVal]       = useState("");
  const [formError, setFormError]   = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Inscriptions list
  const [inscriptions, setInscriptions] = useState(INITIAL_INSCRIPTIONS);
  const [listSearch, setListSearch]     = useState("");
  const [listFilter, setListFilter]     = useState("All");

  // Cancel confirm
  const [confirmId, setConfirmId] = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = ALL_STUDENTS.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (student) => {
    setSelected(student);
    setQuery(student.name);
    setShowDrop(false);
    setFormError("");
  };

  const handleAdd = () => {
    if (!selected)  { setFormError("Please select a student."); return; }
    if (!dateVal)   { setFormError("Please pick a date."); return; }

    // Check duplicate
    const duplicate = inscriptions.find(
      (i) => i.studentId === selected.id && i.class === classVal && i.status === "Active"
    );
    if (duplicate) {
      setFormError(`${selected.name} is already enrolled in ${classVal}.`);
      return;
    }

    const newEntry = {
      id: Date.now(),
      studentId:   selected.id,
      studentName: selected.name,
      class:       classVal,
      date:        dateVal,
      status:      "Active",
    };

    setInscriptions((prev) => [newEntry, ...prev]);
    setSuccessMsg(`${selected.name} enrolled in ${classVal} successfully!`);
    setFormError("");

    // Reset form
    setSelected(null);
    setQuery("");
    setClassVal(CLASSES[0]);
    setDateVal("");

    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleCancel = (id) => {
    setInscriptions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "Cancelled" } : i))
    );
    setConfirmId(null);
  };

  // Filtered list
  const displayedInscriptions = inscriptions.filter((i) => {
    const matchSearch = i.studentName.toLowerCase().includes(listSearch.toLowerCase()) ||
                        i.class.toLowerCase().includes(listSearch.toLowerCase());
    const matchFilter = listFilter === "All" || i.status === listFilter;
    return matchSearch && matchFilter;
  });

  return (
    <Secretary_layout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "6px", boxSizing: "border-box", minWidth: 0 }}>

        {/* ── Page Title ── */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "25px", color: PURPLE, margin: 0 }}>Inscriptions</h2>
          <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "4px" }}>
            Enroll students into classes and manage their registrations.
          </p>
        </div>

        {/* ── Enroll Card ── */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          padding: "28px 32px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          marginBottom: "36px",
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: 500, color: PURPLE, borderBottom: "1px solid #f0e0ee", paddingBottom: "12px", marginBottom: "24px", marginTop: 0 }}>
            New Inscription
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "20px", alignItems: "end" }}>

            {/* Student search */}
            <Field label="Student Name">
              <div style={{ position: "relative" }} ref={dropRef}>
                <input
                  style={inp}
                  placeholder="Search student..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelected(null);
                    setShowDrop(true);
                    setFormError("");
                  }}
                  onFocus={() => setShowDrop(true)}
                />
                {showDrop && query.length > 0 && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    background: "#fff", border: `1px solid #e5e7eb`,
                    borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    zIndex: 50, overflow: "hidden", maxHeight: "220px", overflowY: "auto",
                  }}>
                    {filtered.length === 0 ? (
                      <div style={{ padding: "14px 16px", color: "#9ca3af", fontSize: "13px" }}>No students found</div>
                    ) : filtered.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelect(s)}
                        style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          padding: "10px 16px", cursor: "pointer",
                          borderBottom: "1px solid #f3f4f6",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = LIGHT}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                      >
                        <Avatar initials={s.avatar} size={30} />
                        <div>
                          <div style={{ fontSize: "14px", color: "#111", fontWeight: 500 }}>{s.name}</div>
                          <div style={{ fontSize: "12px", color: "#9ca3af" }}>{s.phone}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            {/* Class */}
            <Field label="Class">
              <select style={sel} value={classVal} onChange={(e) => setClassVal(e.target.value)}>
                {CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>

            {/* Date */}
            <Field label="Start Date">
              <input type="date" style={inp} value={dateVal} onChange={(e) => setDateVal(e.target.value)} />
            </Field>

            {/* Enroll button */}
            <button
              style={btn("solid")}
              onClick={handleAdd}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#5a0f52"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = PURPLE; }}
            >
              + Enroll
            </button>

          </div>

          {/* Errors / Success */}
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
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          padding: "28px 32px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          {/* List header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #f0e0ee", paddingBottom: "16px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 500, color: PURPLE, margin: 0 }}>
              All Inscriptions
              <span style={{ marginLeft: "8px", fontSize: "13px", color: "#9ca3af", fontWeight: 400 }}>
                ({displayedInscriptions.length})
              </span>
            </h3>

            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Search list */}
              <input
                style={{ ...inp, width: "200px" }}
                placeholder="Search name or class..."
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
              />
              {/* Filter */}
              <select style={{ ...sel, width: "130px" }} value={listFilter} onChange={(e) => setListFilter(e.target.value)}>
                <option>All</option>
                <option>Active</option>
                <option>Cancelled</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {displayedInscriptions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>
              No inscriptions found.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {["Student", "Class", "Start Date", "Status", "Action"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#9ca3af", fontWeight: 500, fontSize: "13px", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedInscriptions.map((ins, idx) => (
                    <tr
                      key={ins.id}
                      style={{
                        borderBottom: idx < displayedInscriptions.length - 1 ? "1px solid #f9f9f9" : "none",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#fdf8fc"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Student */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ color: "#701366", fontWeight: 400 }}>{ins.studentName}</span>
                        </div>
                      </td>
                      {/* Class */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: LIGHT, color: PURPLE, padding: "3px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: 500 }}>
                          {ins.class}
                        </span>
                      </td>
                      {/* Date */}
                      <td style={{ padding: "12px 14px", color: "#6b7280" }}>
                        {new Date(ins.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      {/* Status */}
                      <td style={{ padding: "12px 14px" }}>
                        <Badge status={ins.status} />
                      </td>
                      {/* Action */}
                      <td style={{ padding: "12px 14px" }}>
                        {ins.status === "Active" && (
                          confirmId === ins.id ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "12px", color: "#6b7280" }}>Confirm?</span>
                              <button
                                onClick={() => handleCancel(ins.id)}
                                style={{ ...btn("solid"), padding: "5px 12px", fontSize: "12px", background: "#dc2626", borderColor: "#dc2626" }}
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                style={{ ...btn("outline"), padding: "5px 12px", fontSize: "12px" }}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmId(ins.id)}
                              style={{ ...btn("outline"), padding: "6px 14px", fontSize: "12px" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#dc2626"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.color = PURPLE; }}
                            >
                              Cancel
                            </button>
                          )
                        )}
                        {ins.status !== "Active" && (
                          <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Secretary_layout>
  );
}