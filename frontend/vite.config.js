import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendPort = process.env.BACKEND_PORT || "5000";
const backendUrl = process.env.BACKEND_URL || `http://localhost:${backendPort}`;
const port = parseInt(process.env.FRONTEND_PORT || "3000", 10);

// ALLOWED_HOSTS: comma-separated hostnames, or "all" to allow any host.
// Example: ALLOWED_HOSTS=app-hunt.mc-schools.app,localhost
const allowedHosts = process.env.ALLOWED_HOSTS === "all"
  ? true
  : (process.env.ALLOWED_HOSTS || "").split(",").map((h) => h.trim()).filter(Boolean);

export default defineConfig({
  plugins: [react()],
  envDir: "../",
  server: {
    host: "0.0.0.0",
    port,
    allowedHosts: allowedHosts.length ? allowedHosts : undefined,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
});
