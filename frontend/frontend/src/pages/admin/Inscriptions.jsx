import React, { useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Users, UserCheck, UserPlus, Loader2, ChevronLeft, ChevronRight, X, Ban } from "lucide-react";
import Searchbar from "../../components/Searchbar";
import { apiFetch } from "../../services/api";

const PURPLE = "#701366";
const LIGHT  = "#F8E0F8";
const PAGE_SIZE = 10;

// ─── Shared styles (matching Employees page) ─────────────────
const thStyle = {
  padding: "12px 16px", fontSize: "14px", fontWeight: 500,
  textAlign: "center", whiteSpace: "nowrap", color: PURPLE,
};

const tdStyle = {
  padding: "12px 16px", fontSize: "14px", color: PURPLE,
  whiteSpace: "nowrap", textAlign: "center",
};

const statusColors = {
  confirmed: { bg: "#e6f7ec", color: "#1a7f4b" },
  cancelled: { bg: "#fdecea", color: "#c92c2c" },
  promoted:  { bg: "#e8f0fe", color: "#1a56db" },
  repeated:  { bg: "#fff7e0", color: "#946800" },
};

const StatusPill = ({ status }) => {
  const c = statusColors[status?.toLowerCase()] || statusColors.confirmed;
  return (
    <span style={{
      padding: "4px 10px", borderRadius: "999px", fontSize: "12px",
      fontWeight: 600, display: "inline-block", background: c.bg,
      color: c.color, textTransform: "capitalize",
    }}>
      {status || "—"}
    </span>
  );
};

const SummaryCard = ({ icon, label, value, color }) => (
  <div style={{
    flex: 1, background: "white", borderRadius: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "20px 24px",
    display: "flex", alignItems: "center", gap: "16px",
  }}>
    <div style={{
      width: "44px", height: "44px", borderRadius: "12px",
      background: `${color}1a`, color, display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: "13px", color: PURPLE, opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: "22px", fontWeight: 700, color: PURPLE }}>{value}</div>
    </div>
  </div>
);

// Styled to match the Tabs.jsx pattern used on the Fees page — flat,
// no border, light-pink highlight when active. Unlike Tabs.jsx (which
// switches routes via useNavigate), this stays local-state driven since
// these three views live on one page, not three separate routes.
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: "0 16px", height: "32px", borderRadius: "8px",
      fontSize: "14px", border: "none", cursor: "pointer",
      flexShrink: 0, whiteSpace: "nowrap",
      transition: "background 0.15s",
      background: active ? LIGHT : "white",
      color: PURPLE,
    }}
  >
    {children}
  </button>
);

const iconBtn = {
  width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${PURPLE}`,
  background: "white", color: PURPLE, display: "flex",
  alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "background 0.15s, color 0.15s",
};

// Small icon-only action button — same visual pattern as the
// Teachers/Employees page row actions (SquarePen/LayoutGrid): no border,
// transparent background, fills solid on hover, slight scale-up.
const rowIconBtn = {
  padding: "6px", borderRadius: "4px", border: "none", background: "none",
  color: PURPLE, cursor: "pointer",
  transition: "background 0.15s, color 0.15s, transform 0.15s",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0,
};

const rowIconBtnHoverIn = (e) => {
  e.currentTarget.style.background = PURPLE;
  e.currentTarget.style.color = "white";
  e.currentTarget.style.transform = "scale(1.1)";
};
const rowIconBtnHoverOut = (e) => {
  e.currentTarget.style.background = "none";
  e.currentTarget.style.color = PURPLE;
  e.currentTarget.style.transform = "scale(1)";
};

// Danger variant (Cancel) — same shape, red on hover instead of purple
const rowIconBtnDangerHoverIn = (e) => {
  e.currentTarget.style.background = "#dc2626";
  e.currentTarget.style.color = "white";
  e.currentTarget.style.transform = "scale(1.1)";
};

const pageBtn = (active) => ({
  width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${PURPLE}`,
  background: active ? PURPLE : "white", color: active ? "white" : PURPLE,
  fontSize: "13px", fontWeight: 600, cursor: "pointer",
  transition: "background 0.15s, color 0.15s",
});

// ─── Pagination ────────────────────────────────────────────────
const Pagination = ({ page, totalPages, totalItems, goTo }) => {
  if (totalItems === 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", color: PURPLE, marginTop: "-8px" }}>
      <span style={{ opacity: 0.6 }}>
        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalItems)} of {totalItems}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={() => goTo(page - 1)} disabled={page === 1}
          style={{ ...iconBtn, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "default" : "pointer" }}
          onMouseEnter={e => { if (page !== 1) { e.currentTarget.style.background = PURPLE; e.currentTarget.style.color = "white"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = PURPLE; }}
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, i, arr) => {
            if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} style={{ padding: "0 4px", opacity: 0.5 }}>…</span>
            ) : (
              <button key={p} onClick={() => goTo(p)} style={pageBtn(p === page)}>{p}</button>
            )
          )}

        <button
          onClick={() => goTo(page + 1)} disabled={page === totalPages}
          style={{ ...iconBtn, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "default" : "pointer" }}
          onMouseEnter={e => { if (page !== totalPages) { e.currentTarget.style.background = PURPLE; e.currentTarget.style.color = "white"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = PURPLE; }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Enroll Modal ──────────────────────────────────────────────
const EnrollModal = ({ students, classes, presetStudentId, onClose, onSuccess }) => {
  const [studentId, setStudentId] = useState(presetStudentId ?? "");
  const [classId, setClassId]     = useState(classes[0]?.id ? String(classes[0].id) : "");
  const [error, setError]         = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!studentId) { setError("Please select a student."); return; }
    if (!classId)   { setError("Please select a class.");   return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await apiFetch("/inscriptions/", {
        method: "POST",
        body: { student_id: Number(studentId), class_id: Number(classId) },
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Enrollment failed.");
        return;
      }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }} onClick={onClose}>
      <div
        style={{ background: "white", borderRadius: "16px", padding: "28px 32px", width: "420px", maxWidth: "90vw", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: PURPLE, margin: 0 }}>New Inscription</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", color: PURPLE, cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", color: "#9ca3af" }}>Student</label>
            <select
              value={studentId}
              onChange={e => { setStudentId(e.target.value); setError(""); }}
              style={{ width: "100%", border: `1px solid ${PURPLE}`, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: PURPLE, marginTop: "6px", boxSizing: "border-box" }}
            >
              <option value="" disabled>Select a student</option>
              {students.map(s => {
                const p = s.person ?? {};
                return <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>;
              })}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "13px", color: "#9ca3af" }}>Class</label>
            <select
              value={classId}
              onChange={e => { setClassId(e.target.value); setError(""); }}
              style={{ width: "100%", border: `1px solid ${PURPLE}`, borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: PURPLE, marginTop: "6px", boxSizing: "border-box" }}
            >
              <option value="" disabled>Select a class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "13px" }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button
              onClick={onClose}
              style={{ padding: "10px 20px", borderRadius: "8px", fontSize: "14px", border: `1px solid ${PURPLE}`, background: "white", color: PURPLE, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ padding: "10px 20px", borderRadius: "8px", fontSize: "14px", border: `1px solid ${PURPLE}`, background: PURPLE, color: "white", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Enrolling..." : "Enroll"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Needs Placement group card ─────────────────────────────────
const PlacementGroup = ({ className, outcome, students, classes, onAssign, assigning }) => {
  const [selected, setSelected] = useState(() => new Set());
  const [targetClass, setTargetClass] = useState("");

  const allSelected = selected.size > 0 && selected.size === students.length;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(students.map(s => s.person.id)));
  };

  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAssign = () => {
    if (!targetClass || selected.size === 0) return;
    onAssign(Array.from(selected), targetClass, () => setSelected(new Set()));
  };

  return (
    <div style={{ border: `1px solid ${LIGHT}`, borderRadius: "12px", marginBottom: "16px", overflow: "hidden" }}>
      {/* Group header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "10px", padding: "14px 20px", background: LIGHT,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
          <span style={{ fontWeight: 600, color: PURPLE, fontSize: "14px" }}>{className || "No previous class"}</span>
          <StatusPill status={outcome} />
          <span style={{ fontSize: "12px", color: PURPLE, opacity: 0.6 }}>({students.length})</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <select
            value={targetClass}
            onChange={e => setTargetClass(e.target.value)}
            style={{ border: `1px solid ${PURPLE}`, borderRadius: "8px", padding: "7px 10px", fontSize: "13px", color: PURPLE, background: "white" }}
          >
            <option value="" disabled>Select new class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            onClick={handleAssign}
            disabled={!targetClass || selected.size === 0 || assigning}
            style={{
              padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              border: `1px solid ${PURPLE}`, background: PURPLE, color: "white",
              cursor: (!targetClass || selected.size === 0 || assigning) ? "not-allowed" : "pointer",
              opacity: (!targetClass || selected.size === 0 || assigning) ? 0.5 : 1,
            }}
          >
            {assigning ? "Assigning..." : `Assign Selected (${selected.size})`}
          </button>
        </div>
      </div>

      {/* Students in group */}
      <div>
        {students.map((s, idx) => {
          const p = s.person ?? {};
          const fullName = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
          return (
            <div
              key={p.id}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 20px",
                borderBottom: idx < students.length - 1 ? "1px solid #f9f9f9" : "none",
              }}
            >
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggleOne(p.id)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span style={{ fontSize: "14px", color: PURPLE, flex: 1 }}>{fullName || "—"}</span>
              <button
                aria-label="Enroll individually"
                onClick={() => onAssign([p.id], targetClass || null, () => {}, true)}
                style={rowIconBtn}
                onMouseEnter={rowIconBtnHoverIn}
                onMouseLeave={rowIconBtnHoverOut}
              >
                <UserPlus style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Fetchers (outside component, so identity is stable) ────────
const fetchStudents = async () => {
  const res = await apiFetch("/persons/students/");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
};

const fetchClasses = async () => {
  const res = await apiFetch("/academic/classes/");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
};

const fetchInscriptions = async () => {
  const res = await apiFetch("/inscriptions/");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
};

const fetchWaitlisted = async () => {
  const res = await apiFetch("/persons/students/waitlisted/");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
};

const fetchNeedsPlacement = async () => {
  const res = await apiFetch("/persons/students/needs-placement/");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
};

// ─── Main Component ─────────────────────────────────────────────
export default function Inscriptions() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("inscriptions"); // "inscriptions" | "waitlisted" | "placement"

  const { data: students = [] } = useQuery({
    queryKey: ["students"], queryFn: fetchStudents, staleTime: 5 * 60 * 1000,
  });
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"], queryFn: fetchClasses, staleTime: 5 * 60 * 1000,
  });
  const { data: inscriptions = [], isLoading: loadingInscriptions } = useQuery({
    queryKey: ["inscriptions"], queryFn: fetchInscriptions, staleTime: 5 * 60 * 1000,
  });
  const { data: waitlisted = [], isLoading: loadingWaitlisted } = useQuery({
    queryKey: ["waitlisted"], queryFn: fetchWaitlisted, staleTime: 5 * 60 * 1000,
  });
  const { data: needsPlacement = [], isLoading: loadingPlacement } = useQuery({
    queryKey: ["needsPlacement"], queryFn: fetchNeedsPlacement, staleTime: 5 * 60 * 1000,
  });

  const [assigningGroup, setAssigningGroup] = useState(false);

  const [searchInsc, setSearchInsc] = useState("");
  const [filterInsc, setFilterInsc] = useState("All");
  const [searchWait, setSearchWait] = useState("");

  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId]   = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const [modalOpen, setModalOpen]     = useState(false);
  const [modalPreset, setModalPreset] = useState(null);

  // ─── Reset page to 1 when tab/search/filter changes ───────
  const filterKey =
    activeTab === "inscriptions" ? `insc|${searchInsc}|${filterInsc}` :
    activeTab === "waitlisted"   ? `wait|${searchWait}` :
    `placement`;
  const prevKeyRef = useRef(filterKey);
  if (prevKeyRef.current !== filterKey) {
    prevKeyRef.current = filterKey;
    if (page !== 1) setPage(1);
  }

  // ─── Cancel inscription ─────────────────────────────────────
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
      queryClient.invalidateQueries({ queryKey: ["inscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["waitlisted"] }); // cancelled student becomes waitlisted again
    } catch {
      alert("Network error.");
    } finally {
      setCancelling(null);
    }
  };

  // ─── Modal success (single enroll) ──────────────────────────
  const handleEnrollSuccess = () => {
    setModalOpen(false);
    setModalPreset(null);
    queryClient.invalidateQueries({ queryKey: ["inscriptions"] });
    queryClient.invalidateQueries({ queryKey: ["waitlisted"] });
    queryClient.invalidateQueries({ queryKey: ["needsPlacement"] });
  };

  const openModal = (presetStudentId = null) => {
    setModalPreset(presetStudentId);
    setModalOpen(true);
  };

  // ─── Group / individual assign from Needs Placement ─────────
  const handleGroupAssign = async (studentIds, classId, onDone, isIndividual = false) => {
    if (!classId) {
      alert("Pick a class first.");
      return;
    }
    setAssigningGroup(true);
    let success = 0, failed = 0;

    for (const studentId of studentIds) {
      try {
        const res = await apiFetch("/inscriptions/", {
          method: "POST",
          body: { student_id: Number(studentId), class_id: Number(classId) },
        });
        res.ok ? success++ : failed++;
      } catch {
        failed++;
      }
    }

    setAssigningGroup(false);
    onDone();
    if (failed > 0) {
      alert(`${success} enrolled, ${failed} failed.`);
    }
    queryClient.invalidateQueries({ queryKey: ["inscriptions"] });
    queryClient.invalidateQueries({ queryKey: ["waitlisted"] });
    queryClient.invalidateQueries({ queryKey: ["needsPlacement"] });
  };

  // ─── Derived lists ───────────────────────────────────────────
  const displayedInscriptions = [...inscriptions]
    .sort((a, b) => new Date(b.inscription_date) - new Date(a.inscription_date))
    .filter(i => {
      const fullName = i.student_name ?? "";
      const cls = i.class_info?.name ?? "";
      const matchSearch = fullName.toLowerCase().includes(searchInsc.toLowerCase()) ||
                           cls.toLowerCase().includes(searchInsc.toLowerCase());
      const matchFilter = filterInsc === "All" || i.status === filterInsc.toLowerCase();
      return matchSearch && matchFilter;
    });

  const displayedWaitlisted = waitlisted.filter(s => {
    const p = s.person ?? {};
    const fullName = `${p.first_name ?? ""} ${p.last_name ?? ""}`;
    return fullName.toLowerCase().includes(searchWait.toLowerCase());
  });

  // Group needs-placement students by previous class AND outcome —
  // keeping promoted/repeated separate even when they share a class,
  // so one "select all" + one dropdown can never mix the two by mistake.
  const placementGroups = needsPlacement.reduce((acc, s) => {
    const className = s.last_inscription?.class_name ?? "unknown";
    const outcome    = s.last_inscription?.status ?? "unknown";
    const key = `${className}|${outcome}`;
    if (!acc[key]) {
      acc[key] = { className, outcome, students: [] };
    }
    acc[key].students.push(s);
    return acc;
  }, {});

  // Promoted groups first, then repeated — keeps the "move forward" cases
  // visually ahead of the "redo this level" cases.
  const orderedPlacementGroups = Object.values(placementGroups).sort((a, b) => {
    if (a.outcome === b.outcome) return a.className.localeCompare(b.className);
    return a.outcome === "promoted" ? -1 : 1;
  });

  const activeList =
    activeTab === "inscriptions" ? displayedInscriptions :
    activeTab === "waitlisted"   ? displayedWaitlisted :
    []; // placement tab doesn't paginate — grouped view instead

  const totalPages = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  const paginated  = activeList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goTo = (p) => setPage(Math.min(Math.max(p, 1), totalPages));

  const totalStudents   = students.length;
  const waitlistedCount = waitlisted.length;
  const placementCount  = needsPlacement.length;
  const enrolledCount   = Math.max(totalStudents - waitlistedCount - placementCount, 0);

  const loading =
    activeTab === "inscriptions" ? loadingInscriptions :
    activeTab === "waitlisted"   ? loadingWaitlisted :
    loadingPlacement;

  return (
    <DashboardLayout>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px", paddingTop: "0px", boxSizing: "border-box", minWidth: 0 }}>

        {/* Page Title */}
        <div style={{ marginBottom: "4px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: PURPLE, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Inscriptions
          </h1>
          <p style={{ fontSize: "14px", color: PURPLE, opacity: 0.55, margin: "4px 0 0" }}>
            Enroll students into classes and manage their registrations.
          </p>
        </div>

        {/* Summary */}
        <section style={{ display: "flex", gap: "16px", marginTop: "0px", flexWrap: "wrap" }}>
          <SummaryCard icon={<Users size={22} />}     label="Total Students"  value={totalStudents}   color={PURPLE} />
          <SummaryCard icon={<UserCheck size={22} />} label="Enrolled"        value={enrolledCount}    color="#1a7f4b" />
          <SummaryCard icon={<UserPlus size={22} />}  label="Waitlisted"      value={waitlistedCount}  color="#946800" />
          <SummaryCard icon={<UserPlus size={22} />}  label="Needs Placement" value={placementCount}   color="#1a56db" />
        </section>

        {/* Tabs */}
        <section style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <TabButton active={activeTab === "inscriptions"} onClick={() => setActiveTab("inscriptions")}>Inscriptions</TabButton>
          <TabButton active={activeTab === "waitlisted"}   onClick={() => setActiveTab("waitlisted")}>Waitlisted</TabButton>
          <TabButton active={activeTab === "placement"}    onClick={() => setActiveTab("placement")}>
            Needs Placement{placementCount > 0 ? ` (${placementCount})` : ""}
          </TabButton>
        </section>

        {/* Search + Filter + Add (hidden on Needs Placement — it has its own per-group controls) */}
        {activeTab !== "placement" && (
          <section className="flex items-center gap-4">
            <h2 style={{ fontSize: "18px", color: PURPLE, fontWeight: "bold", margin: 0, flexShrink: 0 }}>
              {activeTab === "inscriptions" ? "Inscriptions List" : "Waitlisted Students"}
            </h2>
            {activeTab === "inscriptions" ? (
              <Searchbar
                key="insc"
                placeholder=" Student or class..."
                filterOptions={["Confirmed", "Cancelled", "Promoted", "Repeated"]}
                showAdd={true}
                onAddClick={() => openModal(null)}
                onSearchChange={setSearchInsc}
                onFilterChange={setFilterInsc}
              />
            ) : (
              <Searchbar
                key="wait"
                placeholder=" Student name..."
                filterOptions={[]}
                showAdd={false}
                onSearchChange={setSearchWait}
              />
            )}
          </section>
        )}

        {activeTab === "placement" && (
          <h2 style={{ fontSize: "18px", color: PURPLE, fontWeight: "bold", margin: 0 }}>
            Needs Placement
          </h2>
        )}

        {/* ── Inscriptions / Waitlisted table ── */}
        {activeTab !== "placement" && (
          <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", boxSizing: "border-box" }}>
            {activeTab === "inscriptions" ? (
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ background: LIGHT, height: "48px" }}>
                    <th style={{ ...thStyle, width: "26%" }}>Student</th>
                    <th style={{ ...thStyle, width: "22%" }}>Class</th>
                    <th style={{ ...thStyle, width: "20%" }}>Date</th>
                    <th style={{ ...thStyle, width: "16%" }}>Status</th>
                    <th style={{ ...thStyle, width: "16%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: PURPLE, opacity: 0.6 }}>
                        <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                        <span style={{ fontSize: "14px" }}>Loading inscriptions...</span>
                      </div>
                    </td></tr>
                  )}
                  {!loading && paginated.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: PURPLE, opacity: 0.5, fontSize: "14px" }}>No inscriptions found.</td></tr>
                  )}
                  {!loading && paginated.map((ins, idx) => (
                    <tr
                      key={ins.id}
                      style={{ height: "48px", borderBottom: idx < paginated.length - 1 ? `1px solid ${LIGHT}` : "none", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                      onMouseLeave={e => e.currentTarget.style.background = "white"}
                    >
                      <td style={tdStyle}>{ins.student_name ?? "—"}</td>
                      <td style={tdStyle}>{ins.class_info?.name ?? "—"}</td>
                      <td style={tdStyle}>
                        {ins.inscription_date ? new Date(ins.inscription_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td style={tdStyle}><StatusPill status={ins.status} /></td>
                      <td style={tdStyle}>
                        {ins.status === "confirmed" ? (
                          confirmId === ins.id ? (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                              <span style={{ fontSize: "12px", color: "#6b7280" }}>Confirm?</span>
                              <button
                                onClick={() => handleCancel(ins.id)}
                                disabled={cancelling === ins.id}
                                style={{ padding: "5px 12px", fontSize: "12px", borderRadius: "8px", border: "1px solid #dc2626", background: "#dc2626", color: "white", cursor: "pointer", opacity: cancelling === ins.id ? 0.7 : 1 }}
                              >
                                {cancelling === ins.id ? "..." : "Yes"}
                              </button>
                              <button onClick={() => setConfirmId(null)} style={{ padding: "5px 12px", fontSize: "12px", borderRadius: "8px", border: `1px solid ${PURPLE}`, background: "white", color: PURPLE, cursor: "pointer" }}>No</button>
                            </div>
                          ) : (
                            <button
                              aria-label="Cancel inscription"
                              onClick={() => setConfirmId(ins.id)}
                              style={rowIconBtn}
                              onMouseEnter={rowIconBtnDangerHoverIn}
                              onMouseLeave={rowIconBtnHoverOut}
                            >
                              <Ban style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                            </button>
                          )
                        ) : (
                          <span style={{ color: "#d1d5db", fontSize: "13px" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ background: LIGHT, height: "48px" }}>
                    <th style={{ ...thStyle, width: "28%" }}>Name</th>
                    <th style={{ ...thStyle, width: "20%" }}>Phone</th>
                    <th style={{ ...thStyle, width: "18%" }}>Date of Birth</th>
                    <th style={{ ...thStyle, width: "20%" }}>Parent</th>
                    <th style={{ ...thStyle, width: "14%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: PURPLE, opacity: 0.6 }}>
                        <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                        <span style={{ fontSize: "14px" }}>Loading waitlisted students...</span>
                      </div>
                    </td></tr>
                  )}
                  {!loading && paginated.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: PURPLE, opacity: 0.5, fontSize: "14px" }}>No waitlisted students.</td></tr>
                  )}
                  {!loading && paginated.map((s, idx) => {
                    const p = s.person ?? {};
                    const fullName = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
                    return (
                      <tr
                        key={p.id}
                        style={{ height: "48px", borderBottom: idx < paginated.length - 1 ? `1px solid ${LIGHT}` : "none", transition: "background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fffafe"}
                        onMouseLeave={e => e.currentTarget.style.background = "white"}
                      >
                        <td style={tdStyle}>{fullName || "—"}</td>
                        <td style={tdStyle}>{p.phone || "—"}</td>
                        <td style={tdStyle}>{s.date_of_birth || "—"}</td>
                        <td style={tdStyle}>{s.parent_name || "—"}</td>
                        <td style={tdStyle}>
                          <button
                            aria-label="Enroll student"
                            onClick={() => openModal(p.id)}
                            style={rowIconBtn}
                            onMouseEnter={rowIconBtnHoverIn}
                            onMouseLeave={rowIconBtnHoverOut}
                          >
                            <UserPlus style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Needs Placement grouped view ── */}
        {activeTab === "placement" && (
          <div>
            {loadingPlacement ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: PURPLE, opacity: 0.6, padding: "32px" }}>
                <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "14px" }}>Loading...</span>
              </div>
            ) : Object.keys(placementGroups).length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px", color: PURPLE, opacity: 0.5, fontSize: "14px", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                No students awaiting placement.
              </div>
            ) : (
              orderedPlacementGroups.map(group => (
                <PlacementGroup
                  key={`${group.className}|${group.outcome}`}
                  className={group.className}
                  outcome={group.outcome}
                  students={group.students}
                  classes={classes}
                  onAssign={handleGroupAssign}
                  assigning={assigningGroup}
                />
              ))
            )}
          </div>
        )}

        {/* Pagination (Inscriptions / Waitlisted only) */}
        {activeTab !== "placement" && !loading && (
          <Pagination page={page} totalPages={totalPages} totalItems={activeList.length} goTo={goTo} />
        )}
      </div>

      {modalOpen && (
        <EnrollModal
          students={students}
          classes={classes}
          presetStudentId={modalPreset}
          onClose={() => { setModalOpen(false); setModalPreset(null); }}
          onSuccess={handleEnrollSuccess}
        />
      )}
    </DashboardLayout>
  );
}