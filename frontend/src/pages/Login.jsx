import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import api from "../services/api";

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google credential received");

    if (!credentialResponse?.credential) {
      setError("Google did not return a valid credential.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending credential to backend...");

      const response = await api.post(
        "/api/auth/google",
        {
          credential: credentialResponse.credential,
        },
        {
          timeout: 30000,
        }
      );

      console.log("Backend authentication successful:", response.data);

      // Save token if your backend returns one
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (response.data?.access_token) {
        localStorage.setItem(
          "access_token",
          response.data.access_token
        );
      }

      // Save user information if returned
      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      // Go to dashboard
      window.location.href = "/dashboard";

    } catch (err) {
      console.error("Backend authentication failed:", err);

      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Backend response:", err.response.data);

        setError(
          err.response.data?.detail ||
            "Google authentication failed."
        );
      } else if (err.code === "ECONNABORTED") {
        setError(
          "The backend took too long to respond. Please try again."
        );
      } else if (err.request) {
        setError(
          "Unable to connect to the backend. Please check the deployed API."
        );
      } else {
        setError(
          err.message || "Something went wrong during login."
        );
      }

      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
    setLoading(false);
    setError("Google Sign-In failed. Please try again.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f6ff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px 15px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "515px",
          background: "#ffffff",
          borderRadius: "0 0 18px 18px",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(40, 50, 100, 0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #3f51e8, #7b35e8)",
            padding: "55px 30px",
            textAlign: "center",
            color: "#111",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "15px",
              color: "#ffffff",
            }}
          >
            ◉
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
              fontWeight: "500",
              color: "#111",
            }}
          >
            AI Resume Analyzer
          </h1>

          <p
            style={{
              marginTop: "15px",
              marginBottom: 0,
              fontSize: "19px",
              color: "#ffffff",
            }}
          >
            Build a resume that gets interviews
          </p>
        </div>

        {/* Login content */}
        <div
          style={{
            padding: "50px 35px 60px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "18px",
            }}
          >
            ✦
          </div>

          <h2
            style={{
              fontSize: "28px",
              fontWeight: "500",
              margin: "0 0 12px",
              color: "#111",
            }}
          >
            Welcome Back
          </h2>

          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#58708f",
              margin: "0 auto 30px",
              maxWidth: "430px",
            }}
          >
            Sign in securely with your Google account to access
            your personalized resume analysis dashboard.
          </p>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fff0f0",
                border: "1px solid #ffd0d0",
                borderRadius: "10px",
                padding: "14px 18px",
                marginBottom: "25px",
                color: "#b42318",
                textAlign: "left",
                fontSize: "15px",
                lineHeight: "1.5",
              }}
            >
              <strong>Unable to sign in</strong>
              <div>{error}</div>
            </div>
          )}

          {/* Google login */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              minHeight: "45px",
            }}
          >
            {!loading ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            ) : (
              <div
                style={{
                  color: "#536b88",
                  fontSize: "16px",
                  padding: "12px",
                }}
              >
                Signing in...
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "35px 0",
              color: "#9aa8bb",
              fontSize: "13px",
              letterSpacing: "1px",
            }}
          >
            <div
              style={{
                height: "1px",
                background: "#dfe4ec",
                flex: 1,
              }}
            />

            SECURE GOOGLE SIGN-IN

            <div
              style={{
                height: "1px",
                background: "#dfe4ec",
                flex: 1,
              }}
            />
          </div>

          <p
            style={{
              color: "#58708f",
              fontSize: "15px",
              lineHeight: "1.6",
              margin: "0 auto 25px",
              maxWidth: "410px",
            }}
          >
            Your Google account is securely verified by our
            backend before you access the application.
          </p>

          <p
            style={{
              color: "#8ba0bd",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Resume analysis • Career insights • Interview
            preparation
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;