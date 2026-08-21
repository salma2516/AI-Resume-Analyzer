import axios from "axios";

// =====================================================
// BACKEND API URL
// =====================================================

const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  console.error(
    " VITE_API_URL is not configured. Check your Render environment variables."
  );
}

// Remove trailing slash from backend URL
const API_URL = rawApiUrl
  ? rawApiUrl.trim().replace(/\/+$/, "")
  : "";

console.log("========================================");
console.log("AI RESUME ANALYZER API CONFIG");
console.log("========================================");
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
    // HANDLE FORM DATA
    // -------------------------------------------------

    // IMPORTANT:
    // Do NOT manually set Content-Type when sending
    // FormData.
    //
    // The browser automatically generates:
    //
    // multipart/form-data; boundary=....
    //
    // This is required for PDF upload.

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }

      console.log("📎 FormData request detected");
    } else {
      // -------------------------------------------------
      // NORMAL JSON REQUEST
      // -------------------------------------------------

      config.headers = config.headers || {};

      config.headers["Content-Type"] = "application/json";
    }

    // -------------------------------------------------
    // DEBUG REQUEST
    // -------------------------------------------------

    console.log("========================================");
    console.log(" API REQUEST");
    console.log("Method:", config.method?.toUpperCase());
    console.log("URL:", `${API_URL}${config.url || ""}`);
    console.log("Has token:", Boolean(token));
    console.log(
      "Content type:",
      config.headers?.["Content-Type"] ||
        config.headers?.["content-type"] ||
        "Browser-managed"
    );
    console.log("========================================");

    return config;
  },

  (error) => {
    console.error(" REQUEST INTERCEPTOR ERROR:", error);

    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => {
    console.log("========================================");
    console.log(" API RESPONSE");
    console.log("Status:", response.status);
    console.log(
      "URL:",
      `${response.config?.baseURL || ""}${response.config?.url || ""}`
    );
    console.log("========================================");

    return response;
  },

  (error) => {
    console.error("========================================");
    console.error(" API ERROR");
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
    // BACKEND DID NOT RESPOND
    // -------------------------------------------------

    if (!error.response && error.request) {
      console.error(
        " Backend did not respond."
      );

      console.error(
        "Check your Render backend URL:",
        API_URL
      );
    }

    // -------------------------------------------------
    // UNAUTHORIZED
    // -------------------------------------------------

    if (error.response?.status === 401) {
      console.warn(" Unauthorized request.");

      // Do NOT remove the token during Google login.
      //
      // The Google login endpoint does not require
      // an existing access token.

      if (
        error.config?.url &&
        !error.config.url.includes("/auth/google")
      ) {
        console.warn(
          "Removing invalid access token..."
        );

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth_response");
      }
    }

    // -------------------------------------------------
    // VALIDATION ERROR
    // -------------------------------------------------

    if (error.response?.status === 422) {
      console.error(
        " FastAPI validation error:",
        error.response?.data
      );
    }

    // -------------------------------------------------
    // SERVER ERROR
    // -------------------------------------------------

    if (error.response?.status >= 500) {
      console.error(
        " FastAPI server error."
      );
    }

    return Promise.reject(error);
  }
);

// =====================================================
// EXPORT
// =====================================================

export default api;