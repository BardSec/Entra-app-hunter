import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

async function start() {
  // MSAL Browser v3 requires initialize() before any auth methods are called.
  // Do this before rendering so the instance is fully ready on first render.
  if ((import.meta.env.VITE_AUTH_MODE || "mock") === "delegated") {
    const { msalInstance } = await import("./lib/msal.js");
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

start();
