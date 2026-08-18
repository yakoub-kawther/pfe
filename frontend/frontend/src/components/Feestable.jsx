import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "../services/api";

const STATUS_STYLES = {
  paid:    { bg: "#d7f3ea", color: "#0d7a5f", label: "Paid" },
  pending: { bg: "#fdf0d5", color: "#a4720a", label: "Pending" },
  overdue: { bg: "#fbe0e0", color: "#c02b2b", label: "Overdue" },
};

const thStyle = {
  padding: "12px 16px", fontSize: "13px", fontWeight: 600,
  textAlign: "left", whiteSpace: "nowrap", color: "#701366",
  background: "#F8E0F8",
};

const tdStyle = {
  padding: "10px 16px", fontSize: "13px", color: "#701366",
  whiteSpace: "nowrap", borderTop: "1px solid #f8e0f8",
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

const Pill = ({ status, onClick }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <button
      onClick={onClick}
      style={{
        border: "none", cursor: "pointer", borderRadius: "999px",
        padding: "3px 10px", fontSize: "11px", fontWeight: 500,
        background: s.bg, color: s.color,
      }}
    >
      {s.label}
    </button>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

/**
 * Expected row shape from GET /api/payments/ (paginated):
 * { id, inscription_id, student_id, student_name, language, class_name,
 *   amount, status, payment_date, remark }
 * One row per payment — a student with 3 classes shows up as 3 rows,
 * grouped visually under one name cell via rowSpan.
 */
const FeesTable = ({ search = "", status = "All", onSelectRecord }) => {
  const [rows, setRows]       = useState([]);
  const [count, setCount]     = useState(0);
  const [pageSize, setPageSize] = useState(10); // inferred from first response, see below
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);

  const fetchPage = useCallback((pageNum) => {
    const statusParam = status && status !== "All" ? status.toLowerCase() : "";
    const params = new URLSearchParams({
      search,
      status: statusParam,
      page: String(pageNum),
    });
    return apiFetch(`/payments/?${params.toString()}`).then((r) => r.json());
  }, [search, status]);

  useEffect(() => {
    setLoading(true);
    fetchPage(page)
      .then((data) => {
        const results = Array.isArray(data) ? data : (data.results ?? []);
        setRows(results);
        setCount(typeof data.count === "number" ? data.count : results.length);
        // DRF doesn't send page_size explicitly — infer it from the first
        // full page so "X–Y of Z" and total-page math stay accurate.
        if (results.length > 0) setPageSize((prev) => (page === 1 ? results.length : prev));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchPage, page]);

  // Reset to page 1 whenever search/status change (derived during render,
  // not in an effect — avoids the react-hooks/set-state-in-effect warning).
  const prevKeyRef = useRef(`${search}|${status}`);
  const currentKey = `${search}|${status}`;
  if (prevKeyRef.current !== currentKey) {
    prevKeyRef.current = currentKey;
    if (page !== 1) setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const goTo = (p) => setPage(Math.min(Math.max(p, 1), totalPages));

  // Group consecutive rows by student_id so the name cell can be
  // rowSpanned instead of repeating the full name on every class row.
  const groups = [];
  rows.forEach((row) => {
    const last = groups[groups.length - 1];
    if (last && last.student_id === row.student_id) last.items.push(row);
    else groups.push({ student_id: row.student_id, student_name: row.student_name, items: [row] });
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, paddingLeft: "30px" }}>Full Name</th>
                <th style={thStyle}>Class</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5 }}>
                    Loading...
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#701366", opacity: 0.5 }}>
                    No payments found.
                  </td>
                </tr>
              ) : groups.map((group) => (
                group.items.map((row, i) => (
                  <tr
                    key={row.id}
                    style={{ transition: "background 0.1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fffafe"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                  >
                    {i === 0 && (
                      <td
                        rowSpan={group.items.length}
                        style={{ ...tdStyle, paddingLeft: "30px", verticalAlign: "middle" }}
                      >
                        <Link
                          to="/Payment_student"
                          state={{
                            student: {
                              person: {
                                id: group.student_id,
                                first_name: group.student_name.split(" ")[0] ?? "",
                                last_name: group.student_name.split(" ").slice(1).join(" ") ?? "",
                              },
                            },
                          }}
                          title="View full payment history"
                          style={{ fontWeight: 500, color: "#701366", textDecoration: "none" }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                        >
                          {group.student_name}
                        </Link>
                      </td>
                    )}
                    <td style={tdStyle}>{row.class_name}</td>
                    <td style={tdStyle}>{row.amount} DA</td>
                    <td style={tdStyle}>{formatDate(row.payment_date)}</td>
                    <td style={tdStyle}>
                      <Pill status={row.status} onClick={() => onSelectRecord(row)} />
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination — same look as Employees page */}
      {!loading && count > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: "13px", color: "#701366",
        }}>
          <span style={{ opacity: 0.6 }}>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, count)} of {count}
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

export default FeesTable;