import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/api";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");

    console.log("Google response received");

    // Google must return the ID token
    const credential = credentialResponse?.credential;

    if (!credential) {
      console.error("Missing Google credential:", credentialResponse);
      setError("Google did not return a valid login credential.");
      return;
    }

    try {
      setLoading(true);

      console.log("Sending Google credential to backend...");
      console.log("Backend URL:", api.defaults.baseURL);

      const response = await api.post(
        "/api/auth/google",
        {
          credential: credential,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("Google authentication successful");
      console.log("Backend response:", response.data);

      // --------------------------------------------------
      // SAVE ACCESS TOKEN
      // --------------------------------------------------

      const accessToken =
        response.data?.access_token ||
        response.data?.token;

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }

      // --------------------------------------------------
      // SAVE USER
      // --------------------------------------------------

      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      // --------------------------------------------------
      // SAVE COMPLETE AUTH RESPONSE
      // --------------------------------------------------

      localStorage.setItem(
        "auth_response",
        JSON.stringify(response.data)
      );

      // --------------------------------------------------
      // LOGIN SUCCESS
      // --------------------------------------------------

      window.location.replace("/dashboard");

    } catch (err) {
      console.error("Google authentication error:", err);

      if (err.response) {
        console.error(
          "Backend status:",
          err.response.status
        );

        console.error(
          "Backend response:",
          err.response.data
        );
      }

      let message =
        "Google authentication failed. Please try again.";

      if (err.response?.status === 401) {
        message =
          err.response?.data?.detail ||
          "Google authentication was rejected by the backend.";
      } else if (err.response?.status === 403) {
        message =
          "Google authentication is not permitted for this application.";
      } else if (err.response?.status === 404) {
        message =
          "Authentication endpoint was not found on the backend.";
      } else if (!err.response) {
        message =
          "Unable to connect to the backend. Please check the deployed API.";
      }

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");

    setError(
      "Google Login failed. Please check your Google configuration and try again."
    );
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      {error && (
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            boxSizing: "border-box",
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: "12px",
            color: "#475569",
            fontSize: "14px",
          }}
        >
          Signing you in...
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          auto_select={false}
        />
      )}
    </div>
  );
}