import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    const credential = credentialResponse?.credential;

    console.log("Google credential received:", !!credential);

    if (!credential) {
      setError("Google did not return a login credential.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/api/auth/google", {
        credential: credential,
      });

      console.log("Google authentication successful:", response.data);

      // Store token if your backend returns one
      if (response.data?.access_token) {
        localStorage.setItem(
          "access_token",
          response.data.access_token
        );
      }

      // Store user if returned
      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      // Login successful
      navigate("/dashboard");

    } catch (err) {
      console.error("Google authentication error:", err);

      if (err.response) {
        console.error("Backend status:", err.response.status);
        console.error("Backend response:", err.response.data);

        setError(
          err.response.data?.detail ||
          "Google authentication failed."
        );
      } else if (err.request) {
        setError(
          "Unable to connect to the backend. Please try again."
        );
      } else {
        setError(
          "Something went wrong during Google Sign-In."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign-In failed.");
    setError("Google Sign-In failed. Please try again.");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="login-icon">✦</div>

          <h1>AI Resume Analyzer</h1>

          <p>Build a resume that gets interviews</p>
        </div>

        <div className="login-content">

          <div className="sparkle">✦</div>

          <h2>Welcome Back</h2>

          <p className="login-description">
            Sign in securely with your Google account to access
            your personalized resume analysis dashboard.
          </p>

          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
              >
                ×
              </button>
            </div>
          )}

          <div className="google-login-container">

            {loading ? (
              <div className="login-loading">
                <div className="spinner"></div>
                <span>Signing you in...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                auto_select={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="350"
              />
            )}

          </div>

          <div className="secure-divider">
            <span>SECURE GOOGLE SIGN-IN</span>
          </div>

          <p className="secure-text">
            Your Google account is securely verified by our
            backend before you access the application.
          </p>

          <div className="login-footer">
            Resume analysis • Career insights • Interview preparation
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;