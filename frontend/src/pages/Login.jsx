import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("✅ Google login successful");
    console.log("Credential received:", !!credentialResponse?.credential);

    if (!credentialResponse?.credential) {
      setError("Google did not return a valid credential.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("🔄 Sending Google credential to backend...");

      const response = await api.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });

      console.log("✅ Backend authentication successful");
      console.log("Backend response:", response.data);

      // Save backend response if your backend returns a token
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
      navigate("/dashboard");

    } catch (error) {
      console.error("❌ Backend authentication failed");

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Response:", error.response.data);

        if (error.response.status === 401) {
          setError(
            "Google authentication failed. Please check that the Google Client ID in Render matches the frontend."
          );
        } else if (error.response.status === 404) {
          setError(
            "Google login API endpoint was not found."
          );
        } else if (error.response.status >= 500) {
          setError(
            "The backend server returned an error. Please check Render backend logs."
          );
        } else {
          setError(
            error.response.data?.detail ||
            "Unable to complete Google login."
          );
        }
      } else if (error.request) {
        console.error("No response received from backend:", error.request);

        setError(
          "Unable to connect to the backend. Please check the deployed API."
        );
      } else {
        console.error("Request error:", error.message);

        setError(
          "Something went wrong while signing in."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("❌ Google Login Failed");

    setError(
      "Google Sign-In failed. Please try again."
    );
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="login-icon">✦</div>

          <h1>AI Resume Analyzer</h1>

          <p>
            Build a resume that gets interviews
          </p>
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