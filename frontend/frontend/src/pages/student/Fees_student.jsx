import { useNavigate } from "react-router-dom";
import Student_layout from "../../layouts/Student_layout";
import Searchbar from "../../components/Searchbar";
import { useState, useEffect } from "react";
import { apiFetch } from "../../services/api";

const levelColors = {
  A1: { bg: "#e0f2fe", color: "#0369a1" },
  A2: { bg: "#dbeafe", color: "#1d4ed8" },
  B1: { bg: "#ede9fe", color: "#7c3aed" },
  B2: { bg: "#fae8ff", color: "#a21caf" },
  C1: { bg: "#fce7f3", color: "#be185d" },
  C2: { bg: "#ffe4e6", color: "#be123c" },
};

const extractLevel = (levelName = "") => {
  const match = levelName.match(/\b([ABC][12])\b/i);
  return match ? match[1].toUpperCase() : null;
};

const groupByInscription = (payments) => {
  const map = {};
  for (const p of payments) {
    if (!map[p.inscription_id]) {
      map[p.inscription_id] = {
        inscription_id: p.inscription_id,
        level_name:     p.level_name,
        level:          extractLevel(p.level_name),
        amount:         p.amount,
        payments:       [],
      };
    }
    map[p.inscription_id].payments.push(p);
  }
  return Object.values(map);
};

// Safe fetch: throws a readable error if the response is not JSON / not ok
const safeFetch = async (path) => {
  const res = await apiFetch(path);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} — ${path}\n${text.slice(0, 200)}`);
  }
  return res.json();
};

export default function Fees_student() {
  const navigate = useNavigate();
  const [groups,  setGroups]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    safeFetch("/account/me/")
      .then(account => {
        const studentId = account?.person_id ?? null;
        if (!studentId) throw new Error("Could not resolve student ID from /account/me/");
        return safeFetch(`/payments/student/${studentId}/`);
      })
      .then(data => setGroups(groupByInscription(data)))
      .catch(err => setError(err.message || "Failed to load fees."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = groups.filter(g =>
    g.level_name?.toLowerCase().includes(search.toLowerCase())
  );

  const hasUnpaid = (group) =>
    group.payments.some(p => p.status?.toLowerCase() !== "confirmed");

  const fmtAmount = (val) =>
    val ? `${Number(val).toLocaleString("fr-DZ")} DA` : "—";

  if (loading) return (
    <Student_layout>
      <div style={{ textAlign: "center", padding: "80px", color: "#b48ab0", fontFamily: "Inter, sans-serif" }}>
        Loading...
      </div>
    </Student_layout>
  );

  if (error) return (
    <Student_layout>
      <div style={{ textAlign: "center", padding: "80px", fontFamily: "Inter, sans-serif" }}>
        <p style={{ color: "#dc2626", fontWeight: 500 }}>Failed to load fees</p>
        <pre style={{ fontSize: "12px", color: "#9ca3af", whiteSpace: "pre-wrap", maxWidth: "600px", margin: "12px auto 0" }}>
          {error}
        </pre>
      </div>
    </Student_layout>
  );

  return (
    <Student_layout>
      <div style={{ maxWidth: "1100px", margin: "40px auto", fontFamily: "Inter, sans-serif", padding: "0 24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "24px", color: "#701366", margin: 0 }}>My Fees</h2>
            <p style={{ fontSize: "13px", color: "#b48ab0", margin: "4px 0 0" }}>
              Select a class to view your payment history
            </p>
          </div>
          <div style={{ flex: 1, maxWidth: "380px", minWidth: "200px" }}>
            <Searchbar
              placeholder="Search by level or class..."
              showAdd={false}
              onSearchChange={(val) => setSearch(val)}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: "18px", boxShadow: "0 2px 12px rgba(112,19,102,0.08)", overflow: "hidden", border: "1px solid #f5e0f3" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg, #f8e0f8 0%, #fdf4fd 100%)", height: "52px" }}>
                {[
                  { label: "Class / Level", width: "32%", pl: "28px" },
                  { label: "Level",         width: "14%" },
                  { label: "Payments",      width: "16%" },
                  { label: "Monthly Fee",   width: "20%" },
                  { label: "Status",        width: "18%" },
                ].map(({ label, width, pl }) => (
                  <th key={label} style={{ width, paddingLeft: pl || "16px", paddingRight: "16px", fontSize: "12px", fontWeight: 500, textAlign: "left", color: "#701366", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#b48ab0", fontSize: "14px" }}>
                    No classes found.
                  </td>
                </tr>
              ) : filtered.map((group) => {
                const lc     = levelColors[group.level] || { bg: "#f3f4f6", color: "#374151" };
                const unpaid = hasUnpaid(group);
                return (
                  <tr
                    key={group.inscription_id}
                    onClick={() => navigate("/Fees_detail_student", { state: { group } })}
                    style={{ height: "56px", borderBottom: "1px solid #faeaf9", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fdf6fd"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <td style={{ paddingLeft: "28px", paddingRight: "16px", fontSize: "14px", fontWeight: 500, color: "#701366" }}>
                      {group.level_name || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {group.level ? (
                        <span style={{ background: lc.bg, color: lc.color, padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                          {group.level}
                        </span>
                      ) : <span style={{ color: "#c9a8c9" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", color: "#701366" }}>
                      {group.payments.length} record{group.payments.length !== 1 ? "s" : ""}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 600, color: "#701366" }}>
                      {fmtAmount(group.amount)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "3px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 500,
                        background: unpaid ? "#fee2e2" : "#dcfce7",
                        color:      unpaid ? "#dc2626" : "#16a34a",
                      }}>
                        ● {unpaid ? "Has Unpaid" : "All Paid"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </Student_layout>
  );
}