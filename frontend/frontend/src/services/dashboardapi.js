// // src/services/dashboardApi.js
// //
// // Thin data-fetching layer for the Dashboard page, built on top of the
// // existing apiFetch client (token refresh, auth headers, etc. already
// // handled there).
// //
// // NOTE: adjust this import path to wherever your apiFetch client actually
// // lives in the project (e.g. "../../api/client", "../../lib/api", ...).
// import { apiFetch } from "../../api/client";

// async function unwrap(res, label) {
//   if (!res.ok) {
//     throw new Error(`Failed to fetch ${label} (${res.status})`);
//   }
//   return res.json();
// }

// /* ── Students ───────────────────────────────────────────── */
// export async function fetchStudents() {
//   const res = await apiFetch("/persons/students/");
//   return unwrap(res, "students");
// }

// /* ── Teachers ───────────────────────────────────────────── */
// export async function fetchTeachers() {
//   const res = await apiFetch("/persons/teachers/");
//   return unwrap(res, "teachers");
// }

// /* ── Payments ───────────────────────────────────────────── */
// // GET /payments/pending/ returns a plain (unpaginated) array.
// export async function fetchPendingPayments() {
//   const res = await apiFetch("/payments/pending/");
//   return unwrap(res, "pending payments");
// }

// // GET /payments/?status=paid is paginated (PaymentsPagination, page_size=25).
// // We only need the total count, which DRF's paginated response includes,
// // so we don't have to fetch every page.
// export async function fetchPaidPaymentsCount() {
//   const res = await apiFetch("/payments/?status=paid&page=1");
//   const data = await unwrap(res, "paid payments");
//   return data.count ?? 0;
// }

// /* ── Aggregate for the Dashboard stat cards ────────────────
//    Everything else on the dashboard (today's classes, attendance %,
//    student growth, language distribution) has no backend endpoint yet
//    and stays as static/mock data in Dashboard.jsx for now.
// */
// export async function fetchDashboardStats() {
//   const [students, teachers, pending, paidCount] = await Promise.all([
//     fetchStudents(),
//     fetchTeachers(),
//     fetchPendingPayments(),
//     fetchPaidPaymentsCount(),
//   ]);

//   return {
//     totalStudents: Array.isArray(students) ? students.length : 0,
//     totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
//     paidPayments: paidCount,
//     pendingPayments: Array.isArray(pending) ? pending.length : 0,
//   };
// }