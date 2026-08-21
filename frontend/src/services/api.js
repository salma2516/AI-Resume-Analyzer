import axios from "axios";

// =====================================================
// BACKEND API URL
// =====================================================

const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  console.error(
    "❌ VITE_API_URL is not configured. Check your Render environment variables."
  );
}

const API_URL = rawApiUrl
  ? rawApiUrl.trim().replace(/\/+$/, "")
  : "";

console.log("========================================");
console.log("AI RESUME ANALYZER API CONFIG");
console.log("API URL:", API_URL);
console.log("========================================");

// =====================================================
// AXIOS INSTANCE
// =====================================================

const api = axios.create({
  baseURL: API_URL,

  timeout: 60000,

  headers: {
    Accept: "application/json",
  },
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {
    // -------------------------------------------------
    // GET ACCESS TOKEN
    // -------------------------------------------------

    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // -------------------------------------------------
    // HANDLE FORM DATA CORRECTLY
    // -------------------------------------------------

    // IMPORTANT:
    // Do NOT manually set Content-Type for FormData.
    // The browser/Axios will automatically create:
    //
    // multipart/form-data; boundary=....
    //
    // This is required when uploading the PDF resume.

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }

      console.log("📎 Sending FormData request");
    } else {
      // Normal JSON request
      config.headers = config.headers || {};

      config.headers["Content-Type"] = "application/json";
    }

    // -------------------------------------------------
    // DEBUG REQUEST
    // -------------------------------------------------

    console.log("➡️ API REQUEST");
    console.log("Method:", config.method?.toUpperCase());
    console.log("URL:", `${API_URL}${config.url || ""}`);

    return config;
  },

  (error) => {
    console.error("❌ REQUEST INTERCEPTOR ERROR:", error);

    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => {
    console.log("✅ API RESPONSE");
    console.log("Status:", response.status);
    console.log("URL:", response.config?.url);

    return response;
  },

  (error) => {
    console.error("========================================");
    console.error("❌ API ERROR");
    console.error("========================================");

    console.error("Message:", error.message);

    console.error(
      "URL:",
      error.config?.baseURL
        ? `${error.config.baseURL}${error.config.url || ""}`
        : error.config?.url
    );

    console.error(
      "Method:",
      error.config?.method?.toUpperCase()
    );

    console.error(
      "Status:",
      error.response?.status
    );

    console.error(
      "Response:",
      error.response?.data
    );

    console.error(
      "Request:",
      error.request
    );

    console.error("========================================");

    // -------------------------------------------------
    // BACKEND UNAVAILABLE
    // -------------------------------------------------

    if (!error.response && error.request) {
      console.error(
        "🚨 Backend did not respond. Check the Render backend URL."
      );
    }

    // -------------------------------------------------
    // UNAUTHORIZED
    // -------------------------------------------------

    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized request.");

      // Don't immediately remove token during Google login
      // because the login request itself is not authenticated.
      //
      // For other authenticated requests, remove invalid token.

      if (
        error.config?.url &&
        !error.config.url.includes("/auth/google")
      ) {
        localStorage.removeItem("access_token");
      }
    }

    return Promise.reject(error);
  }
);

// =====================================================
// EXPORT
// =====================================================

export default api;