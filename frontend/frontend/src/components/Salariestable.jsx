import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "../services/api";

const MONTHS = [
  { n: 1,  label: "Jan" }, { n: 2,  label: "Feb" }, { n: 3,  label: "Mar" },
  { n: 4,  label: "Apr" }, { n: 5,  label: "May" }, { n: 6,  label: "Jun" },
  { n: 7,  label: "Jul" }, { n: 8,  label: "Aug" }, { n: 9,  label: "Sep" },
  { n: 10, label: "Oct" }, { n: 11, label: "Nov" }, { n: 12, label: "Dec" },
];

const STATUS_STYLES = {
  paid:    { bg: "#d7f3ea", color: "#0d7a5f", label: "Paid" },
  pending: { bg: "#fdf0d5", color: "#a4720a", label: "Pending" },
};

const thStyle = {
  padding: "12px 10px", fontSize: "13px", fontWeight: 600,
  textAlign: "center", whiteSpace: "nowrap", color: "#701366",
  background: "#F8E0F8",
};

const thNameStyle = { ...thStyle, textAlign: "left" };
const thPositionStyle = { ...thStyle, textAlign: "left" };

const tdStyle = {
  padding: "10px 10px", fontSize: "13px", color: "#701366",
  textAlign: "center", whiteSpace: "nowrap", borderTop: "1px solid #f8e0f8",
};

const PAGE_SIZE = 10;

const Pill = ({ status, onClick }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <button
      onClick={onClick}
      style={{
        border: "none", cursor: "pointer", borderRadius: "999px",
        padding: "3px 9px", fontSize: "11px", fontWeight: 500,
        background: s.bg, color: s.color,
      }}
    >
      {s.label}
    </button>
  );
};

const pageBtn = (active) => ({
  width: "32px", height: "32px",
  borderRadius: "8px", border: "1px solid #701366",
  background: active ? "#701366" : "white",
  color: active ? "white" : "#701366",
  fontSize: "13px", fontWeight: 600,
  cursor: "pointer", transition: "background 0.15s, color 0.15s",
});

const iconBtn = {
  width: "32px", height: "32px",
  borderRadius: "8px", border: "1px solid #701366",
  background: "white", color: "#701366",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "background 0.15s, color 0.15s",
};

const SalariesTable = ({ search = "", position = "All", year, onSelectRecord }) => {
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const navigate = useNavigate();

  const fetchTable = useCallback(() => {
    // No page/page_size here — the backend doesn't paginate this endpoint,
    // so we fetch the full filtered set once and paginate client-side.
    const params = new URLSearchParams({ year, search, position });
    return apiFetch(`/salaries/table/?${params.toString()}`).then((r) => r.json());
  }, [search, position, year]);

  useEffect(() => {
    setLoading(true);
    fetchTable()
      .then((data) => setAllRows(data.results ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchTable]);

  // Reset to page 1 when search/position/year changes (derived during
  // render, not in an effect — same pattern used on the Employees page).
  const prevKeyRef = useRef(`${search}|${position}|${year}`);
  const currentKey = `${search}|${position}|${year}`;
  if (prevKeyRef.current !== currentKey) {
    prevKeyRef.current = currentKey;
    if (page !== 1) setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
  const paginated  = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goTo = (p) => setPage(Math.min(Math.max(p, 1), totalPages));

  const cellFor = (emp, monthNum) => {
    const record = emp.months?.[monthNum];
    if (record) return { record };

    const hire = new Date(emp.hire_date);
    const hireYear = hire.getFullYear();
    const hireMonth = hire.getMonth() + 1;
    const beforeHire = year < hireYear || (year === hireYear && monthNum < hireMonth);

    return { record: null, dash: beforeHire };
  };

  const goToPayment = async (emp) => {
    const isTeacher = (emp.position ?? "").toLowerCase() === "teacher";
    try {
      if (isTeacher) {
        const res = await apiFetch(`/persons/teachers/${emp.employee_id}/`);
        const teacher = await res.json();
        navigate("/Teacher_payment", { state: { teacher } });
      } else {
        const res = await apiFetch(`/persons/employees/${emp.employee_id}/`);
        const employee = await res.json();
        navigate("/Employee_payment", { state: { employee } });
      }
    } catch (err) {
      console.error("Failed to load full record before navigating:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
            <thead>
              <tr>
                <th style={{ ...thNameStyle, paddingLeft: "30px", minWidth: "160px" }}>Full Name</th>
                <th style={{ ...thPositionStyle, minWidth: "120px" }}>Position</th>
                {MONTHS.map((m) => <th key={m.n} style={thStyle}>{m.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5 }}>
                    Loading...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5 }}>
                    No employees found.
                  </td>
                </tr>
              ) : paginated.map((emp) => (
                <tr
                  key={emp.employee_id}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fffafe"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                >
                  <td style={{ ...tdStyle, textAlign: "left", paddingLeft: "30px", fontWeight: 500 }}>
                    <button
                      onClick={() => goToPayment(emp)}
                      style={{
                        background: "none", border: "none", padding: 0, margin: 0,
                        font: "inherit", color: "#701366", fontWeight: 500, cursor: "pointer",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                    >
                      {emp.full_name}
                    </button>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "left" }}>
                    {emp.position}
                  </td>
                  {MONTHS.map((m) => {
                    const { record, dash } = cellFor(emp, m.n);
                    if (record) {
                      return (
                        <td key={m.n} style={tdStyle}>
                          <Pill
                            status={record.status}
                            onClick={() => onSelectRecord({
                              ...record,
                              employee_id: emp.employee_id,
                              month_num: m.n,
                              full_name: emp.full_name,
                              position: emp.position,
                              month: m.label,
                              year,
                            })}
                          />
                        </td>
                      );
                    }
                    return (
                      <td key={m.n} style={tdStyle}>
                        {dash ? <span style={{ color: "#eee" }}>–</span> : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination — same look as Employees page */}
      {!loading && allRows.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: "13px", color: "#701366",
        }}>
          <span style={{ opacity: 0.6 }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, allRows.length)} of {allRows.length}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              style={{ ...iconBtn, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "default" : "pointer" }}
              onMouseEnter={e => { if (page !== 1) { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; }}
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
                  <button key={p} onClick={() => goTo(p)} style={pageBtn(p === page)}>
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
              style={{ ...iconBtn, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "default" : "pointer" }}
              onMouseEnter={e => { if (page !== totalPages) { e.currentTarget.style.background = "#701366"; e.currentTarget.style.color = "white"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#701366"; }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalariesTable;