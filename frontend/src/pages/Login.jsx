import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Google login callback received");

    const credential = credentialResponse?.credential;

    if (!credential) {
      console.error("Google did not return an ID token");
      setError("Google authentication failed. No credential received.");
      return;
    }

    console.log("Google ID token received");
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/google", {
        credential: credential,
      });

      console.log("Backend authentication successful");
      console.log("Response:", response.data);

      // Save returned user/token if your backend provides one
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (response.data?.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
      }

      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      // Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Backend authentication failed:", error);

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Backend response:", error.response.data);

        setError(
          error.response.data?.detail ||
            `Authentication failed (${error.response.status})`
        );
      } else if (error.request) {
        console.error("No response received from backend");

        setError(
          "Unable to connect to the backend. Please check the deployed API."
        );
      } else {
        console.error("Request error:", error.message);

        setError("Something went wrong during Google authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");

    setError(
      "Google Sign-In failed. Please try again."
    );
  };

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-header">
          <div className="login-icon">
            ✦
          </div>

          <h1>AI Resume Analyzer</h1>

          <p>Build a resume that gets interviews</p>
        </div>

        <div className="login-content">

          <div className="sparkle">
            ✦
          </div>

          <h2>Welcome Back</h2>

          <p className="login-description">
            Sign in securely with your Google account to access
            your personalized resume analysis dashboard.
          </p>

          {error && (
            <div className="login-error">
              <span>⚠</span>
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="error-close"
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="login-loading">
              <div className="spinner"></div>
              <p>Signing you in...</p>
            </div>
          ) : (
            <div className="google-login">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="350"
              />
            </div>
          )}

          <div className="secure-divider">
            <span></span>
            <p>SECURE GOOGLE SIGN-IN</p>
            <span></span>
          </div>

          <p className="secure-text">
            Your Google account is securely verified by our backend
            before you access the application.
          </p>

          <p className="login-footer">
            Resume analysis • Career insights • Interview preparation
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;