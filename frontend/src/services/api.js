import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://ai-resume-analyzer-1-xg6b.onrender.com",
});

export default api;