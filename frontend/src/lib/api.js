import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 30_000,
});

// Attach delegated auth token if present (stored after MSAL sign-in)
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("entra_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── API functions ─────────────────────────────────────────────────────────────

export const fetchHealth = () => api.get("/health").then((r) => r.data);

export const fetchDashboard = () => api.get("/dashboard").then((r) => r.data);

export const fetchApps = (params = {}) =>
  api.get("/apps", { params }).then((r) => r.data);

export const fetchApp = (id) => api.get(`/apps/${id}`).then((r) => r.data);

export const fetchCompliance = () =>
  api.get("/compliance").then((r) => r.data);

export default api;
