import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
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
