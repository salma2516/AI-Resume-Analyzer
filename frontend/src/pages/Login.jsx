import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import { GoogleLogin } from "@react-oauth/google";


// =========================================================
// API CONFIGURATION
// =========================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";


// =========================================================
// LOGIN COMPONENT
// =========================================================

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // =======================================================
  // CHECK EXISTING LOGIN
  // =======================================================

  useEffect(() => {
    const isLoggedIn =
      localStorage.getItem("isLoggedIn") === "true";

    const storedUser =
      localStorage.getItem("aiResumeUser");

    const googleToken =
      sessionStorage.getItem("google_id_token") ||
      localStorage.getItem("google_id_token");

    const accessToken =
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("access_token");

    if (
      isLoggedIn &&
      storedUser &&
      (googleToken || accessToken)
    ) {
      navigate("/dashboard", {
        replace: true,
      });
    } else if (isLoggedIn || storedUser) {
      // Remove incomplete/stale login state.
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("aiResumeUser");
      localStorage.removeItem("google_id_token");
      localStorage.removeItem("access_token");

      sessionStorage.removeItem("google_id_token");
      sessionStorage.removeItem("access_token");
    }
  }, [navigate]);


  // =======================================================
  // GOOGLE LOGIN SUCCESS
  // =======================================================

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    const credential =
      credentialResponse?.credential;


    // -------------------------------------------------------
    // VALIDATE GOOGLE CREDENTIAL
    // -------------------------------------------------------

    if (!credential) {
      setError(
        "Google did not return a valid authentication credential."
      );

      return;
    }


    // -------------------------------------------------------
    // START LOADING
    // -------------------------------------------------------

    // Remove a stale Google credential before starting a
    // fresh Google sign-in flow.
    sessionStorage.removeItem("google_id_token");

    setLoading(true);
    setError("");


    try {
      console.log(
        "Google credential received."
      );

      console.log(
        "Connecting to:",
        `${API_URL}/api/auth/google`
      );


      // =====================================================
      // SEND CREDENTIAL TO FASTAPI
      // =====================================================

      const response = await fetch(
        `${API_URL}/api/auth/google`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            credential,
          }),
        }
      );


      // =====================================================
      // READ BACKEND RESPONSE
      // =====================================================

      let data = {};

      const responseText =
        await response.text();

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          console.warn(
            "Backend returned non-JSON response."
          );
        }
      }


      console.log(
        "Backend status:",
        response.status
      );

      console.log(
        "Backend response:",
        data
      );


      // =====================================================
      // HANDLE BACKEND ERRORS
      // =====================================================

      if (!response.ok) {
        let message =
          data?.detail ||
          "Google authentication failed.";


        if (response.status === 400) {
          message =
            data?.detail ||
            "The Google authentication request was invalid.";
        }


        if (response.status === 401) {
          message =
            data?.detail ||
            "Google authentication was rejected. Please try signing in again.";
        }


        if (response.status === 404) {
          message =
            "The Google authentication API could not be found. Make sure the FastAPI backend is running.";
        }


        if (response.status === 500) {
          message =
            data?.detail ||
            "The authentication server encountered an error.";
        }


        throw new Error(message);
      }


      // =====================================================
      // VALIDATE SUCCESS RESPONSE
      // =====================================================

      if (
        data?.success !== true ||
        !data?.user
      ) {
        console.error(
          "Invalid authentication response:",
          data
        );

        throw new Error(
          "Authentication succeeded, but the server did not return valid user information."
        );
      }


      // =====================================================
      // GET AUTHENTICATED USER
      // =====================================================

      const authenticatedUser =
        data.user;


      // =====================================================
      // SAVE LOGIN STATE
      // =====================================================

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      localStorage.setItem(
        "aiResumeUser",
        JSON.stringify(
          authenticatedUser
        )
      );


      // =====================================================
      // SAVE AUTHENTICATION TOKENS
      // =====================================================

      // Backend access token, when provided.
      if (data.access_token) {
        sessionStorage.setItem(
          "access_token",
          data.access_token
        );

        localStorage.setItem(
          "access_token",
          data.access_token
        );
      }

      // IMPORTANT:
      // Keep the original Google ID token for protected
      // application-tracking endpoints such as:
      //
      // POST /api/applications/mark-applied
      // GET  /api/applications
      // PATCH /api/applications/{id}/status
      //
      // sessionStorage is used so the Google credential is
      // cleared when the browser session ends.
      // IMPORTANT:
      // Jobs.jsx and ApplicationHistory.jsx use this token for
      // protected application-tracking API requests.
      //
      // Store it in both locations so a route change or component
      // reload does not leave the application without a token.
      sessionStorage.setItem(
        "google_id_token",
        credential
      );

      localStorage.setItem(
        "google_id_token",
        credential
      );

      console.log(
        "Google ID token stored for authenticated API calls."
      );


      console.log(
        "Google authentication successful."
      );

      console.log(
        "Authenticated user:",
        authenticatedUser
      );


      // =====================================================
      // REDIRECT
      // =====================================================

      navigate("/dashboard", {
        replace: true,
      });

    } catch (err) {

      console.error(
        "Google authentication error:",
        err
      );


      // -----------------------------------------------------
      // NETWORK ERROR
      // -----------------------------------------------------

      if (
        err?.name === "TypeError" ||
        err?.message
          ?.toLowerCase()
          .includes("failed to fetch")
      ) {
        setError(
          "Unable to connect to the backend. Make sure FastAPI is running on http://127.0.0.1:8000."
        );
      } else {

        setError(
          err?.message ||
            "Unable to sign in with Google. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  // =======================================================
  // GOOGLE LOGIN ERROR
  // =======================================================

  const handleGoogleError = () => {
    console.error(
      "Google Login Failed."
    );

    setLoading(false);

    setError(
      "Google sign-in was cancelled or could not be completed. Please try again."
    );
  };


  // =======================================================
  // CLEAR ERROR
  // =======================================================

  const clearError = () => {
    setError("");
  };


  // =======================================================
  // UI
  // =======================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",

        width: "100%",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        background:
          "linear-gradient(135deg,#EFF6FF 0%,#EEF2FF 50%,#F5F3FF 100%)",

        px: 2,

        py: 4,

        boxSizing: "border-box",
      }}
    >

      {/* ===================================================
          LOGIN CARD
      =================================================== */}

      <Paper
        elevation={8}
        sx={{
          width: "100%",

          maxWidth: 450,

          borderRadius: 4,

          overflow: "hidden",

          boxShadow:
            "0 20px 50px rgba(15,23,42,0.15)",
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <Box
          sx={{
            background:
              "linear-gradient(135deg,#2563EB,#7C3AED)",

            color: "#FFFFFF",

            textAlign: "center",

            px: 4,

            py: 5,
          }}
        >

          <Box
            sx={{
              width: 70,

              height: 70,

              borderRadius: "20px",

              margin: "0 auto 18px",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              backgroundColor:
                "rgba(255,255,255,0.18)",

              border:
                "1px solid rgba(255,255,255,0.25)",

              boxShadow:
                "0 8px 25px rgba(0,0,0,0.12)",
            }}
          >

            <DescriptionOutlinedIcon
              sx={{
                fontSize: 42,
              }}
            />

          </Box>


          <Typography
            variant="h4"
            fontWeight={800}
          >
            AI Resume Analyzer
          </Typography>


          <Typography
            sx={{
              mt: 1,

              opacity: 0.9,

              fontSize: "0.98rem",
            }}
          >
            Build a resume that gets interviews
          </Typography>

        </Box>


        {/* =================================================
            LOGIN CONTENT
        ================================================= */}

        <Box
          sx={{
            px: {
              xs: 3,
              sm: 4,
            },

            py: 5,

            textAlign: "center",
          }}
        >

          <AutoAwesomeIcon
            sx={{
              color: "#7C3AED",

              fontSize: 34,

              mb: 1,
            }}
          />


          <Typography
            variant="h5"
            fontWeight={700}
            color="#0F172A"
          >
            Welcome Back
          </Typography>


          <Typography
            sx={{
              mt: 1,

              mb: 3,

              color: "#64748B",

              lineHeight: 1.6,
            }}
          >
            Sign in securely with your Google
            account to access your personalized
            resume analysis dashboard.
          </Typography>


          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <Alert
              severity="error"
              onClose={clearError}
              sx={{
                mb: 3,

                textAlign: "left",

                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}


          {/* =================================================
              GOOGLE LOGIN
          ================================================= */}

          <Box
            sx={{
              minHeight: 46,

              display: "flex",

              justifyContent: "center",

              alignItems: "center",

              mb: 3,
            }}
          >

            {loading ? (

              <Box
                sx={{
                  display: "flex",

                  flexDirection: "column",

                  alignItems: "center",

                  gap: 1,
                }}
              >

                <CircularProgress
                  size={30}
                  thickness={4}
                  sx={{
                    color: "#2563EB",
                  }}
                />


                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                  }}
                >
                  Verifying your Google account...
                </Typography>

              </Box>

            ) : (

              <GoogleLogin
                onSuccess={
                  handleGoogleSuccess
                }

                onError={
                  handleGoogleError
                }

                useOneTap={false}

                theme="outline"

                size="large"

                text="continue_with"

                shape="rectangular"

                width="320"
              />

            )}

          </Box>


          {/* =================================================
              DIVIDER
          ================================================= */}

          <Divider sx={{ my: 3 }}>

            <Typography
              sx={{
                fontSize: 11,

                color: "#94A3B8",

                fontWeight: 700,

                letterSpacing: "0.08em",
              }}
            >
              SECURE GOOGLE SIGN-IN
            </Typography>

          </Divider>


          {/* =================================================
              SECURITY MESSAGE
          ================================================= */}

          <Typography
            sx={{
              fontSize: 13,

              color: "#64748B",

              lineHeight: 1.7,
            }}
          >
            Your Google account is securely
            verified by our backend before you
            access the application.
          </Typography>


          <Typography
            sx={{
              mt: 2,

              fontSize: 12,

              color: "#94A3B8",
            }}
          >
            Resume analysis • Career insights •
            Interview preparation
          </Typography>

        </Box>

      </Paper>

    </Box>
  );
}