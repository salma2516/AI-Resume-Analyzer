import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ai-resume-analyzer-1-xg6b.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;