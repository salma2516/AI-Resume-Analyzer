import {
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";

import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";

import { useState } from "react";

export default function DownloadPDF() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const downloadReport = async () => {
    try {
      setDownloading(true);
      setError("");

      const reportUrl = `${
        import.meta.env.VITE_API_URL ||
        "https://ai-resume-analyzer-1-xg6b.onrender.com"
      }/api/report`;


      const response = await fetch(reportUrl);

      if (!response.ok) {
        throw new Error(
          `Unable to download report. Server returned ${response.status}.`
        );
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error("The generated PDF is empty.");
      }

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
        err?.message ||
          "Unable to download the resume analysis report."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: 900,
          margin: "40px auto",
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          boxShadow:
            "0 8px 25px rgba(15,23,42,0.15)",
          boxSizing: "border-box",
        }}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <Box
          sx={{
            background:
              "linear-gradient(135deg,#EF4444,#DC2626)",

            color: "#FFFFFF",

            textAlign: "center",

            px: {
              xs: 2,
              sm: 3,
              md: 4,
            },

            py: {
              xs: 3,
              sm: 4,
            },
          }}
        >
          <PictureAsPdfIcon
            sx={{
              fontSize: {
                xs: 42,
                sm: 48,
              },
              mb: 1,
            }}
          />

          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              fontSize: {
                xs: "1.7rem",
                sm: "2rem",
                md: "2.2rem",
              },
            }}
          >
            Resume Analysis Report
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              opacity: 0.95,
              fontSize: {
                xs: "0.9rem",
                sm: "1rem",
              },
            }}
          >
            Download your complete AI-generated report
          </Typography>
        </Box>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <Box
          sx={{
            textAlign: "center",

            px: {
              xs: 2,
              sm: 3,
              md: 4,
            },

            py: {
              xs: 3,
              sm: 4,
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
            }}
          >
            Your report includes:
          </Typography>

          {/* REPORT FEATURES */}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,

              mb: 3,
            }}
          >
            <Typography>
              ✓ ATS Score
            </Typography>

            <Typography>
              ✓ Resume Score
            </Typography>

            <Typography>
              ✓ Job Match
            </Typography>

            <Typography>
              ✓ AI Suggestions
            </Typography>

            <Typography>
              ✓ Resume Improvements
            </Typography>

            <Typography>
              ✓ Career Roadmap
            </Typography>

            <Typography>
              ✓ Interview Questions
            </Typography>

            <Typography>
              ✓ Cover Letter
            </Typography>
          </Box>

          {/* DOWNLOAD BUTTON */}

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={downloadReport}
            disabled={downloading}
            sx={{
              backgroundColor: "#DC2626",

              px: {
                xs: 2.5,
                sm: 4,
              },

              py: 1.5,

              borderRadius: 2,

              fontWeight: 700,

              fontSize: {
                xs: "0.85rem",
                sm: "1rem",
              },

              textTransform: "uppercase",

              boxShadow:
                "0 6px 16px rgba(220,38,38,0.25)",

              minWidth: {
                xs: "100%",
                sm: 290,
              },

              "&:hover": {
                backgroundColor: "#B91C1C",
              },

              "&:disabled": {
                backgroundColor: "#FCA5A5",
                color: "#FFFFFF",
              },
            }}
          >
            {downloading
              ? "Downloading..."
              : "Download PDF Report"}
          </Button>
        </Box>
      </Box>

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity="error"
          onClose={() => setError("")}
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}