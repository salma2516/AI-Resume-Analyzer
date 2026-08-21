import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    allowedHosts: [
      "ai-resume-analyzer-1.onrender.com",
    ],
  },

  preview: {
    host: "0.0.0.0",
    allowedHosts: [
      "ai-resume-analyzer-1.onrender.com",
    ],
  },

  build: {
    outDir: "dist",
    sourcemap: false,
  },
});