const API_BASE = "http://localhost:8000/api";

// ─── Token helpers ────────────────────────────────────────────
export const getAccess  = () => localStorage.getItem("access");
export const getRefresh = () => localStorage.getItem("refresh");

export const saveTokens = ({ access, refresh, role, full_name }) => {
  localStorage.setItem("access",    access);
  localStorage.setItem("refresh",   refresh);
  localStorage.setItem("role",      role      ?? "");
  localStorage.setItem("full_name", full_name ?? "");
};

export const clearTokens = () => {
  ["access", "refresh", "role", "full_name"].forEach((k) =>
    localStorage.removeItem(k)
  );
};

// ─── Refresh access token ─────────────────────────────────────
async function refreshAccessToken() {
  const refresh = getRefresh();
  if (!refresh) throw new Error("No refresh token.");

  const res = await fetch(`${API_BASE}/account/refresh/`, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    window.location.href = "/";          // redirect to login
    throw new Error("Session expired.");
  }

  const data = await res.json();
  localStorage.setItem("access", data.access);
  return data.access;
}

// ─── Main fetch wrapper ───────────────────────────────────────
// Usage: apiFetch("/persons/teachers/")
//        apiFetch("/accounts/logout/", { method: "POST", body: { refresh } })
export async function apiFetch(path, options = {}) {
  const { body, ...rest } = options;

  const buildHeaders = (token) => ({
    "Content-Type" : "application/json",
    "Authorization": `Bearer ${token}`,
    ...(rest.headers ?? {}),
  });

  const doRequest = (token) =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: buildHeaders(token),
      body   : body ? JSON.stringify(body) : undefined,
    });

  let res = await doRequest(getAccess());

  // Auto-refresh on 401 and retry once
  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    res = await doRequest(newAccess);
  }

  return res;
}