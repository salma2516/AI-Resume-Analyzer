import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("========================================");
    console.log("GOOGLE LOGIN SUCCESS CALLBACK");
    console.log("========================================");

    const credential = credentialResponse?.credential;

    if (!credential) {
      console.error("Google did not return a credential.");

      setError(
        "Google did not return a valid login credential. Please try again."
      );

      setLoading(false);
      return;
    }

    console.log("Google credential received:", true);
    console.log(
      "Credential preview:",
      `${credential.substring(0, 15)}...`
    );

    try {
      setLoading(true);
      setError("");

      console.log("Sending credential to backend...");
      console.log(
        "Backend URL:",
        import.meta.env.VITE_API_URL
      );

      const response = await api.post(
        "/api/auth/google",
        {
          credential: credential,
        },
        {
          timeout: 20000,
        }
      );

      console.log("========================================");
      console.log("BACKEND GOOGLE LOGIN RESPONSE");
      console.log("========================================");
      console.log("Status:", response.status);
      console.log("Data:", response.data);

      const data = response.data || {};

      // --------------------------------------------------
      // SAVE ACCESS TOKEN
      // --------------------------------------------------

      const accessToken =
        data.access_token ||
        data.accessToken ||
        data.token;

      if (accessToken) {
        localStorage.setItem(
          "access_token",
          accessToken
        );

        console.log("Access token saved.");
      } else {
        console.warn(
          "Backend did not return an access token."
        );
      }

      // --------------------------------------------------
      // SAVE USER
      // --------------------------------------------------

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        console.log("User information saved.");
      }

      // --------------------------------------------------
      // SAVE COMPLETE RESPONSE
      // --------------------------------------------------

      localStorage.setItem(
        "auth_response",
        JSON.stringify(data)
      );

      // --------------------------------------------------
      // SAVE LOGIN STATE
      // --------------------------------------------------

      localStorage.setItem(
        "is_authenticated",
        "true"
      );

      console.log(
        "Google login successful."
      );

      console.log(
        "Redirecting to dashboard..."
      );

      // Make sure loading is stopped before navigation
      setLoading(false);

      navigate("/dashboard", {
        replace: true,
      });

    } catch (err) {
      console.error("========================================");
      console.error("GOOGLE LOGIN ERROR");
      console.error("========================================");
      console.error(err);

      setLoading(false);

      // --------------------------------------------------
      // BACKEND RESPONDED WITH ERROR
      // --------------------------------------------------

      if (err.response) {
        const status = err.response.status;
        const backendData = err.response.data;

        console.error(
          "Backend status:",
          status
        );

        console.error(
          "Backend response:",
          backendData
        );

        const detail =
          backendData?.detail ||
          backendData?.message ||
          backendData?.error;

        if (status === 400) {
          setError(
            detail ||
              "Invalid Google login request. Please try signing in again."
          );
        } else if (status === 401) {
          setError(
            detail ||
              "Google authentication was rejected. Please check the Google OAuth configuration."
          );
        } else if (status === 403) {
          setError(
            detail ||
              "Google authentication is forbidden. Please check the OAuth settings."
          );
        } else if (status === 404) {
          setError(
            "Google login API endpoint was not found. Please check the backend URL."
          );
        } else if (status >= 500) {
          setError(
            detail ||
              "The backend encountered an error while verifying your Google account."
          );
        } else {
          setError(
            detail ||
              `Google authentication failed (${status}). Please try again.`
          );
        }

        return;
      }

      // --------------------------------------------------
      // REQUEST SENT BUT NO RESPONSE
      // --------------------------------------------------

      if (err.request) {
        console.error(
          "No response received from backend."
        );

        console.error(
          "Configured API URL:",
          import.meta.env.VITE_API_URL
        );

        setError(
          "The backend did not respond. Please check the deployed API URL and Render backend service."
        );

        return;
      }

      // --------------------------------------------------
      // REQUEST CONFIGURATION ERROR
      // --------------------------------------------------

      console.error(
        "Request configuration error:",
        err.message
      );

      setError(
        "Unable to send the Google login request. Please try again."
      );
    }
  };

  // ------------------------------------------------------
  // GOOGLE LOGIN ERROR
  // ------------------------------------------------------

  const handleGoogleError = () => {
    console.error(
      "Google Sign-In button returned an error."
    );

    setLoading(false);

    setError(
      "Google Sign-In was cancelled or failed. Please select your Google account and try again."
    );
  };

  // ------------------------------------------------------
  // CLOSE ERROR
  // ------------------------------------------------------

  const handleCloseError = () => {
    setError("");
    setLoading(false);
  };

  // ------------------------------------------------------
  // LOGIN PAGE
  // ------------------------------------------------------

  return (
    <div className="login-page">

      <div className="login-card">

        {/* ================================================
            HEADER
        ================================================= */}

        <div className="login-header">

          <div className="login-icon">
            ✦
          </div>

          <h1>
            AI Resume Analyzer
          </h1>

          <p>
            Build a resume that gets interviews
          </p>

        </div>


        {/* ================================================
            LOGIN CONTENT
        ================================================= */}

        <div className="login-content">

          <div className="sparkle">
            ✦
          </div>

          <h2>
            Welcome Back
          </h2>

          <p className="login-description">
            Sign in securely with your Google account to
            access your personalized resume analysis
            dashboard.
          </p>


          {/* ==============================================
              ERROR MESSAGE
          ============================================== */}

          {error && (
            <div
              className="login-error"
              role="alert"
            >

              <span className="error-icon">
                ⚠️
              </span>

              <span className="error-message">
                {error}
              </span>

              <button
                type="button"
                className="error-close"
                onClick={handleCloseError}
                aria-label="Close error"
              >
                ×
              </button>

            </div>
          )}


          {/* ==============================================
              GOOGLE LOGIN
          ============================================== */}

          <div className="google-login-container">

            {loading ? (

              <div className="login-loading">

                <div className="spinner"></div>

                <span>
                  Signing you in...
                </span>

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


          {/* ==============================================
              SECURITY DIVIDER
          ============================================== */}

          <div className="secure-divider">

            <span>
              SECURE GOOGLE SIGN-IN
            </span>

          </div>


          {/* ==============================================
              SECURITY DESCRIPTION
          ============================================== */}

          <p className="secure-text">
            Your Google account is securely verified by
            our backend before you access the application.
          </p>


          {/* ==============================================
              FOOTER
          ============================================== */}

          <div className="login-footer">
            <span>
              Resume analysis
            </span>

            <span>•</span>

            <span>
              Career insights
            </span>

            <span>•</span>

            <span>
              Interview preparation
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;