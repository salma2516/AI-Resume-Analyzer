import React, { useState } from "react";

import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function Report() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // FastAPI PDF endpoint
  const reportUrl = "http://127.0.0.1:8000/api/report";

  // =========================================================
  // OPEN REPORT
  // =========================================================

  const openReport = () => {
    setError("");

    window.open(
      reportUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const downloadReport = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(reportUrl);

      if (!response.ok) {
        let message = "Unable to download the report.";

        try {
          const data = await response.json();

          if (data?.detail) {
            message = data.detail;
          }
        } catch {
          // Response was not JSON
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "resume_analysis_report.pdf";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);

      setError(
        err.message ||
          "Could not download the PDF report."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REPORT CONTENT
  // =========================================================

  const reportItems = [
    "ATS Score",
    "Resume Score",
    "Job Match",
    "AI Suggestions",
    "Resume Improvements",
    "Career Roadmap",
    "Interview Questions",
    "AI-Generated Cover Letter",
  ];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        mx: "auto",
        px: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        py: 4,
        boxSizing: "border-box",
      }}
    >
      {/* =====================================================
          REPORT CARD
      ===================================================== */}

      <Box
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow:
            "0 10px 35px rgba(15,23,42,0.12)",
        }}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <Box
          sx={{
            background:
              "linear-gradient(135deg,#EF4444,#DC2626)",
            color: "#FFFFFF",
            textAlign: "center",
            px: 3,
            py: 5,
          }}
        >
          <PictureAsPdfIcon
            sx={{
              fontSize: 58,
              mb: 1,
            }}
          />

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              fontSize: {
                xs: "1.8rem",
                sm: "2.2rem",
              },
            }}
          >
            Resume Analysis Report
          </Typography>

          <Typography
            sx={{
              mt: 1,
              opacity: 0.95,
              fontSize: {
                xs: "0.95rem",
                sm: "1rem",
              },
            }}
          >
            Your complete AI-generated resume
            analysis report
          </Typography>
        </Box>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <Box
          sx={{
            p: {
              xs: 3,
              md: 5,
            },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mb: 3,
              textAlign: "center",
              color: "#0F172A",
            }}
          >
            Your report includes
          </Typography>

          {/* =================================================
              REPORT FEATURES
          ================================================= */}

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },

              gap: 2,

              mb: 4,
            }}
          >
            {reportItems.map((item) => (
              <Box
                key={item}
                sx={{
                  p: 2,

                  borderRadius: 2,

                  backgroundColor:
                    "#F8FAFC",

                  border:
                    "1px solid #E2E8F0",

                  transition:
                    "all 0.2s ease",

                  "&:hover": {
                    backgroundColor:
                      "#EFF6FF",

                    borderColor:
                      "#93C5FD",

                    transform:
                      "translateY(-2px)",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#1E293B",
                  }}
                >
                  ✓ {item}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          {/* =================================================
              BUTTONS
          ================================================= */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            justifyContent="center"
          >
            {/* OPEN REPORT */}

            <Button
              variant="contained"
              startIcon={
                <OpenInNewIcon />
              }
              onClick={openReport}
              sx={{
                backgroundColor: "#2563EB",

                px: 4,
                py: 1.4,

                borderRadius: 2,

                fontWeight: 700,

                minWidth: {
                  xs: "100%",
                  sm: 200,
                },

                "&:hover": {
                  backgroundColor: "#1D4ED8",
                },
              }}
            >
              Open Report
            </Button>

            {/* DOWNLOAD REPORT */}

            <Button
              variant="contained"
              startIcon={
                loading ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                  />
                ) : (
                  <DownloadIcon />
                )
              }
              onClick={downloadReport}
              disabled={loading}
              sx={{
                backgroundColor: "#DC2626",

                px: 4,
                py: 1.4,

                borderRadius: 2,

                fontWeight: 700,

                minWidth: {
                  xs: "100%",
                  sm: 200,
                },

                "&:hover": {
                  backgroundColor: "#B91C1C",
                },
              }}
            >
              {loading
                ? "Downloading..."
                : "Download PDF"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}