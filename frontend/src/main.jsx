import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import { msalInstance } from "./lib/msal.js";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || "mock";

// In delegated mode, MSAL browser v3 requires initialize() to be called and
// awaited BEFORE any auth APIs are used.  MsalProvider only calls initialize()
// inside a useEffect — i.e. after React's first render — which creates a race
// where AuthContext's useEffect can call acquireTokenSilent() on an
// uninitialized instance, causing auth to silently fail or loop forever.
//
// Pre-initializing here ensures the instance is fully ready (including
// handleRedirectPromise) before the React tree mounts, eliminating the race.
async function bootstrap() {
  if (AUTH_MODE === "delegated") {
    await msalInstance.initialize();
  }

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

bootstrap().catch((err) => {
  // Surface initialization errors instead of showing a blank screen.
  console.error("App failed to start:", err);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:24px;background:#f9fafb">
        <div style="background:#fff;border:1px solid #fca5a5;border-radius:16px;padding:32px;max-width:480px;width:100%;box-shadow:0 1px 3px rgba(0,0,0,.07)">
          <h1 style="color:#dc2626;font-size:1.1rem;margin:0 0 8px;font-weight:600">App failed to start</h1>
          <p style="color:#374151;font-size:.875rem;margin:0 0 12px;font-family:monospace;word-break:break-word">${err?.message || String(err)}</p>
          <button onclick="location.reload()" style="background:#4f46e5;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:.875rem;cursor:pointer;font-family:inherit">Reload</button>
        </div>
      </div>
    `;
  }
});
