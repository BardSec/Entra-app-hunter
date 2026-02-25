import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendPort = process.env.BACKEND_PORT || "5000";
const backendUrl = process.env.BACKEND_URL || `http://localhost:${backendPort}`;
const port = parseInt(process.env.FRONTEND_PORT || "3000", 10);

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
});
