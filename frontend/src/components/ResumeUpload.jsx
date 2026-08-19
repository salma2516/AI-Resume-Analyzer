import { useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
  Stack,
  Alert,
  Grid,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import api from "../services/api";

export default function ResumeUpload({ setResult }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // FILE SELECTION
  // =========================================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");

    if (!selectedFile) {
      return;
    }

    // -------------------------------------------------------
    // PDF VALIDATION
    // -------------------------------------------------------

    const isPDF =
      selectedFile.type === "application/pdf" ||
      selectedFile.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPDF) {
      setFile(null);
      setError("Please upload a PDF resume.");
      return;
    }

    // -------------------------------------------------------
    // SIZE VALIDATION - 10 MB
    // -------------------------------------------------------

    const maxSize = 10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setFile(null);
      setError(
        "Resume file must be smaller than 10 MB."
      );
      return;
    }

    setFile(selectedFile);
  };

  // =========================================================
  // REMOVE FILE
  // =========================================================

  const handleRemoveFile = () => {
    setFile(null);
    setError("");

    // Reset file input if required
    const input =
      document.getElementById(
        "resume-file-input"
      );

    if (input) {
      input.value = "";
    }
  };

  // =========================================================
  // SAVE ANALYSIS FOR ALL PAGES
  // =========================================================

  const saveAnalysisData = (
    analysisData,
    uploadedFile,
    currentJobDescription
  ) => {
    try {
      const savedData = {
        ...analysisData,

        // ---------------------------------------------------
        // APPLICATION METADATA
        // ---------------------------------------------------

        resume_file_name:
          uploadedFile?.name || "",

        job_description:
          currentJobDescription || "",

        analyzed_at:
          new Date().toISOString(),

        // Useful aliases for frontend pages
        uploaded_at:
          new Date().toISOString(),
      };

      // -----------------------------------------------------
      // SAVE COMPLETE ANALYSIS
      // -----------------------------------------------------

      localStorage.setItem(
        "latestResumeAnalysis",
        JSON.stringify(savedData)
      );

      // -----------------------------------------------------
      // SAVE RESUME INFORMATION
      // -----------------------------------------------------

      localStorage.setItem(
        "latestResumeFileName",
        uploadedFile?.name || ""
      );

      localStorage.setItem(
        "latestJobDescription",
        currentJobDescription || ""
      );

      localStorage.setItem(
        "latestResumeAnalysisTime",
        savedData.analyzed_at
      );

      // -----------------------------------------------------
      // CUSTOM EVENT
      //
      // This allows Candidate / Skills / Jobs / Roadmap /
      // Report to update immediately in the same browser tab.
      // -----------------------------------------------------

      window.dispatchEvent(
        new CustomEvent(
          "resumeAnalysisUpdated",
          {
            detail: savedData,
          }
        )
      );

      console.log(
        "Resume analysis saved successfully."
      );

      console.log(savedData);

      return savedData;
    } catch (storageError) {
      console.error(
        "Failed to save resume analysis:",
        storageError
      );

      return analysisData;
    }
  };

  // =========================================================
  // ANALYZE RESUME
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // -------------------------------------------------------
    // VALIDATE RESUME
    // -------------------------------------------------------

    if (!file) {
      setError(
        "Please upload your PDF resume."
      );
      return;
    }

    // -------------------------------------------------------
    // VALIDATE JOB DESCRIPTION
    // -------------------------------------------------------

    if (!jobDescription.trim()) {
      setError(
        "Please enter the job description."
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      "resume",
      file
    );

    formData.append(
      "job_description",
      jobDescription.trim()
    );

    try {
      setLoading(true);

      // -----------------------------------------------------
      // CLEAR PREVIOUS RESULT
      // -----------------------------------------------------

      if (setResult) {
        setResult(null);
      }

      /*
       * Do NOT remove the old result before the request
       * succeeds from the UI.
       *
       * We only replace localStorage after the backend
       * successfully returns the new analysis.
       */

      console.log(
        "========================================"
      );

      console.log(
        "STARTING RESUME ANALYSIS"
      );

      console.log(
        "Resume:",
        file.name
      );

      console.log(
        "Job description length:",
        jobDescription.length
      );

      console.log(
        "========================================"
      );

      // -----------------------------------------------------
      // API REQUEST
      // -----------------------------------------------------

      const response = await api.post(
        "/analyze/",
        formData
      );

      // -----------------------------------------------------
      // BACKEND RESPONSE
      // -----------------------------------------------------

      console.log(
        "========== API RESPONSE =========="
      );

      console.log(response.data);

      console.log(
        "=================================="
      );

      // -----------------------------------------------------
      // VALIDATE RESPONSE
      // -----------------------------------------------------

      if (
        !response.data ||
        typeof response.data !== "object"
      ) {
        throw new Error(
          "The backend returned an invalid analysis response."
        );
      }

      // -----------------------------------------------------
      // SAVE RESULT FOR ALL PAGES
      // -----------------------------------------------------

      const savedAnalysis =
        saveAnalysisData(
          response.data,
          file,
          jobDescription.trim()
        );

      // -----------------------------------------------------
      // UPDATE DASHBOARD
      // -----------------------------------------------------

      if (setResult) {
        setResult(savedAnalysis);
      }

      // -----------------------------------------------------
      // SUCCESS MESSAGE
      // -----------------------------------------------------

      setError("");

      console.log(
        "========================================"
      );

      console.log(
        "RESUME ANALYSIS COMPLETED SUCCESSFULLY"
      );

      console.log(
        "Saved as: latestResumeAnalysis"
      );

      console.log(
        "========================================"
      );
    } catch (err) {
      console.error(
        "Resume analysis error:",
        err
      );

      // -----------------------------------------------------
      // DO NOT DESTROY PREVIOUS SAVED ANALYSIS
      // IF NEW ANALYSIS FAILED
      // -----------------------------------------------------

      if (err.response) {
        const detail =
          err.response.data?.detail;

        if (typeof detail === "string") {
          setError(detail);
        } else {
          setError(
            "Resume analysis failed. Please check the FastAPI backend."
          );
        }
      } else if (err.request) {
        setError(
          "Unable to connect to FastAPI. Make sure the backend server is running."
        );
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(
          "Something went wrong while analyzing the resume."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <Card
      id="upload"
      elevation={4}
      sx={{
        width: "100%",
        maxWidth: "none",
        mx: "auto",
        mt: 3,
        mb: 4,
        borderRadius: {
          xs: 3,
          md: 4,
        },
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        boxSizing: "border-box",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box
        sx={{
          background:
            "linear-gradient(135deg,#2563EB 0%,#4F46E5 50%,#7C3AED 100%)",
          px: {
            xs: 3,
            sm: 4,
            md: 5,
          },
          py: {
            xs: 2.8,
            sm: 3,
            md: 3.5,
          },
          textAlign: "center",
        }}
      >
        <Typography
          component="h2"
          sx={{
            color: "#FFFFFF",
            fontSize: {
              xs: "1.6rem",
              sm: "1.9rem",
              md: "2.2rem",
            },
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          AI Resume Analyzer
        </Typography>

        <Typography
          sx={{
            mt: 0.8,
            color:
              "rgba(255,255,255,0.92)",
            fontSize: {
              xs: "0.9rem",
              sm: "0.98rem",
              md: "1rem",
            },
          }}
        >
          Upload your resume and compare it
          with any job description.
        </Typography>
      </Box>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <CardContent
        sx={{
          px: {
            xs: 2,
            sm: 3,
            md: 4,
            lg: 5,
          },
          py: {
            xs: 2.5,
            sm: 3,
            md: 3.5,
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <Alert
                severity="error"
                onClose={() =>
                  setError("")
                }
                sx={{
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            {/* =================================================
                RESUME + JOB DESCRIPTION
            ================================================== */}

            <Grid
              container
              spacing={{
                xs: 2.5,
                md: 3,
              }}
              alignItems="stretch"
            >
              {/* =================================================
                  RESUME UPLOAD
              ================================================== */}

              <Grid
                item
                xs={12}
                md={6}
              >
                <Box
                  sx={{
                    height: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      mb: 1,
                      fontWeight: 700,
                      color: "#172554",
                      fontSize: {
                        xs: "0.95rem",
                        md: "1rem",
                      },
                    }}
                  >
                    Upload Resume
                  </Typography>

                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    disabled={loading}
                    startIcon={
                      <UploadFileIcon />
                    }
                    sx={{
                      minHeight: {
                        xs: 70,
                        md: 72,
                      },
                      borderWidth: 2,
                      borderStyle: "dashed",
                      borderColor: "#60A5FA",
                      color: "#2563EB",
                      borderRadius: 3,
                      fontSize: {
                        xs: "0.9rem",
                        md: "0.98rem",
                      },
                      fontWeight: 700,
                      "&:hover": {
                        borderWidth: 2,
                        borderStyle: "dashed",
                        borderColor: "#2563EB",
                        backgroundColor:
                          "rgba(37,99,235,0.04)",
                      },
                    }}
                  >
                    Choose PDF Resume

                    <input
                      id="resume-file-input"
                      hidden
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={
                        handleFileChange
                      }
                    />
                  </Button>

                  {!file && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        textAlign: "center",
                        color: "#64748B",
                      }}
                    >
                      Supported format: PDF •
                      Maximum size: 10 MB
                    </Typography>
                  )}

                  {/* =================================================
                      SELECTED FILE
                  ================================================== */}

                  {file && (
                    <Box
                      sx={{
                        mt: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "space-between",
                        gap: 1.5,
                        p: 1.2,
                        borderRadius: 2,
                        backgroundColor:
                          "#ECFDF5",
                        border:
                          "1px solid #86EFAC",
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <DescriptionIcon
                          sx={{
                            color: "#2563EB",
                            flexShrink: 0,
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize:
                              "0.9rem",
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {file.name}
                        </Typography>

                        <CheckCircleIcon
                          sx={{
                            color: "#16A34A",
                            fontSize: 20,
                            flexShrink: 0,
                          }}
                        />
                      </Box>

                      <Button
                        size="small"
                        color="error"
                        onClick={
                          handleRemoveFile
                        }
                        disabled={loading}
                        sx={{
                          flexShrink: 0,
                          minWidth: 75,
                          fontWeight: 600,
                          textTransform:
                            "none",
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* =================================================
                  JOB DESCRIPTION
              ================================================== */}

              <Grid
                item
                xs={12}
                md={6}
              >
                <Box>
                  <Typography
                    sx={{
                      mb: 1,
                      fontWeight: 700,
                      color: "#172554",
                      fontSize: {
                        xs: "0.95rem",
                        md: "1rem",
                      },
                    }}
                  >
                    Paste Job Description
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={6}
                    placeholder="Paste the complete job description here..."
                    value={jobDescription}
                    onChange={(event) =>
                      setJobDescription(
                        event.target.value
                      )
                    }
                    disabled={loading}
                    sx={{
                      "& .MuiOutlinedInput-root":
                        {
                          borderRadius: 3,
                          backgroundColor:
                            "#FFFFFF",
                          fontSize:
                            "0.95rem",
                          minHeight: {
                            xs: 120,
                            md: 140,
                          },
                          alignItems:
                            "flex-start",
                        },
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "flex-end",
                      mt: 0.7,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {jobDescription.length}{" "}
                      characters
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* =================================================
                ANALYZE BUTTON
            ================================================== */}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress
                    size={22}
                    color="inherit"
                  />
                ) : (
                  <AutoAwesomeIcon />
                )
              }
              sx={{
                minHeight: 56,
                py: 1.4,
                borderRadius: 3,
                fontSize: {
                  xs: "1rem",
                  md: "1.05rem",
                },
                fontWeight: 800,
                textTransform: "uppercase",
                background:
                  "linear-gradient(90deg,#2563EB,#7C3AED)",
                boxShadow:
                  "0 8px 20px rgba(37,99,235,0.22)",
                "&:hover": {
                  background:
                    "linear-gradient(90deg,#1D4ED8,#6D28D9)",
                  transform:
                    "translateY(-1px)",
                  boxShadow:
                    "0 12px 25px rgba(37,99,235,0.3)",
                },
                "&:disabled": {
                  background:
                    "linear-gradient(90deg,#93C5FD,#C4B5FD)",
                  color: "#FFFFFF",
                },
                transition:
                  "all 0.2s ease",
              }}
            >
              {loading
                ? "Analyzing Resume..."
                : "Analyze Resume"}
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}