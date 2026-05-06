import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const bff = process.env.VITE_BFF_ORIGIN ?? "http://localhost:3000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/login": { target: bff, changeOrigin: true },
      "/callback": { target: bff, changeOrigin: true },
      "/api": { target: bff, changeOrigin: true },
    },
  },
});
