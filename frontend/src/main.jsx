import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import "./index.css";

// =====================================================
// GOOGLE CLIENT ID
// =====================================================

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;

// =====================================================
// DEBUG INFORMATION
// =====================================================

console.log("====================================");
console.log("FRONTEND CONFIGURATION");
console.log("====================================");

console.log(
  "Google Client ID:",
  googleClientId
    ? "Loaded successfully"
    : "MISSING"
);

console.log(
  "API URL:",
  import.meta.env.VITE_API_URL ||
    "Using default Render backend"
);

console.log("====================================");

// =====================================================
// STOP APP IF GOOGLE CLIENT ID IS MISSING
// =====================================================

if (!googleClientId) {
  console.error(
    "VITE_GOOGLE_CLIENT_ID is missing."
  );

  console.error(
    "Add VITE_GOOGLE_CLIENT_ID to the frontend Render Environment variables."
  );
}

// =====================================================
// RENDER APPLICATION
// =====================================================

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider
        clientId={googleClientId}
      >
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);