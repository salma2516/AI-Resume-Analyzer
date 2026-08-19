import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  LinearProgress,
  Divider,
} from "@mui/material";

import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CodeIcon from "@mui/icons-material/Code";

export default function Roadmap() {
  const [analysis, setAnalysis] = useState(null);

  // =========================================================
  // LOAD LATEST RESUME ANALYSIS
  // =========================================================

  const loadAnalysis = () => {
    try {
      const saved =
        localStorage.getItem("latestResumeAnalysis");

      if (saved) {
        setAnalysis(JSON.parse(saved));
      } else {
        setAnalysis(null);
      }
    } catch (error) {
      console.error(
        "Failed to load resume analysis:",
        error
      );

      setAnalysis(null);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadAnalysis();

    const handleResumeUpdate = (event) => {
      if (event?.detail) {
        setAnalysis(event.detail);
      } else {
        loadAnalysis();
      }
    };

    const handleStorageUpdate = () => {
      loadAnalysis();
    };

    window.addEventListener(
      "resumeAnalysisUpdated",
      handleResumeUpdate
    );

    window.addEventListener(
      "storage",
      handleStorageUpdate
    );

    return () => {
      window.removeEventListener(
        "resumeAnalysisUpdated",
        handleResumeUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorageUpdate
      );
    };
  }, []);

  // =========================================================
  // EXTRACT SKILLS
  // =========================================================

  const skills = useMemo(() => {
    if (!analysis) {
      return [];
    }

    const rawSkills =
      analysis?.skills ||
      analysis?.candidate?.skills ||
      analysis?.extracted_skills ||
      [];

    if (!Array.isArray(rawSkills)) {
      return [];
    }

    return rawSkills
      .map((skill) => {
        if (typeof skill === "string") {
          return skill;
        }

        return (
          skill?.name ||
          skill?.skill ||
          skill?.title ||
          ""
        );
      })
      .filter(Boolean);
  }, [analysis]);

  // =========================================================
  // CREATE ROADMAP
  // =========================================================

  const roadmapSteps = useMemo(() => {
    const skillText = skills
      .join(" ")
      .toLowerCase();

    const steps = [];

    // -------------------------------------------------------
    // STEP 1
    // -------------------------------------------------------

    steps.push({
      number: 1,
      title: "Strengthen Core Skills",
      description:
        "Review the technical skills identified in your resume and strengthen the areas most relevant to your target career.",
      status: "Current Focus",
      progress: 70,
      icon: CodeIcon,
    });

    // -------------------------------------------------------
    // STEP 2
    // -------------------------------------------------------

    if (
      skillText.includes("python") ||
      skillText.includes("machine learning") ||
      skillText.includes("tensorflow") ||
      skillText.includes("ai")
    ) {
      steps.push({
        number: 2,
        title: "Build AI / ML Projects",
        description:
          "Create practical projects that demonstrate your ability to apply Python, machine learning and AI concepts to real-world problems.",
        status: "Recommended",
        progress: 50,
        icon: AutoAwesomeIcon,
      });
    } else {
      steps.push({
        number: 2,
        title: "Build Practical Projects",
        description:
          "Create 2–3 strong portfolio projects that demonstrate your technical and problem-solving abilities.",
        status: "Recommended",
        progress: 50,
        icon: AutoAwesomeIcon,
      });
    }

    // -------------------------------------------------------
    // STEP 3
    // -------------------------------------------------------

    steps.push({
      number: 3,
      title: "Improve Interview Readiness",
      description:
        "Practice technical interviews, coding problems, behavioral questions and resume-based interview questions.",
      status: "Upcoming",
      progress: 30,
      icon: SchoolOutlinedIcon,
    });

    // -------------------------------------------------------
    // STEP 4
    // -------------------------------------------------------

    steps.push({
      number: 4,
      title: "Apply for Target Roles",
      description:
        "Use your improved resume, projects and interview preparation to apply for suitable entry-level roles and internships.",
      status: "Upcoming",
      progress: 15,
      icon: FlagOutlinedIcon,
    });

    return steps;
  }, [skills]);

  // =========================================================
  // NO RESUME
  // =========================================================

  if (!analysis) {
    return (
      <Box
        sx={{
          minHeight: "100%",
          p: {
            xs: 2,
            md: 4,
          },
          background: "#F8FAFC",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 4,
              md: 6,
            },
            borderRadius: 4,
            textAlign: "center",
            border:
              "1px solid #E2E8F0",
            background: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg,#2563EB,#7C3AED)",
              color: "#FFFFFF",
            }}
          >
            <TrendingUpIcon
              sx={{ fontSize: 42 }}
            />
          </Box>

          <Typography
            variant="h5"
            fontWeight={800}
            color="#0F172A"
          >
            Career Roadmap
          </Typography>

          <Typography
            sx={{
              mt: 1,
              maxWidth: 600,
              mx: "auto",
              color: "#64748B",
              lineHeight: 1.7,
            }}
          >
            Upload and analyze your resume first.
            Your personalized career roadmap will
            appear here based on your skills and
            career profile.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <Box
      sx={{
        minHeight: "100%",
        p: {
          xs: 2,
          md: 4,
        },
        background: "#F8FAFC",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={800}
          color="#0F172A"
        >
          Career Roadmap
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color: "#64748B",
          }}
        >
          A step-by-step plan based on your latest
          resume analysis.
        </Typography>
      </Box>

      {/* =====================================================
          AI SUMMARY
      ===================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 3,
            md: 4,
          },
          mb: 3,
          borderRadius: 4,
          color: "#FFFFFF",
          background:
            "linear-gradient(135deg,#2563EB,#7C3AED)",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "rgba(255,255,255,0.18)",
            }}
          >
            <AutoAwesomeIcon
              sx={{ fontSize: 30 }}
            />
          </Box>

          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
            >
              AI Career Development Plan
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                opacity: 0.9,
              }}
            >
              Your roadmap updates whenever you
              analyze a new resume.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* =====================================================
          ROADMAP
      ===================================================== */}

      <Grid
        container
        spacing={3}
      >
        {roadmapSteps.map(
          (step, index) => {
            const StepIcon = step.icon;

            return (
              <Grid
                item
                xs={12}
                key={step.number}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: {
                      xs: 2.5,
                      md: 3,
                    },
                    borderRadius: 4,
                    border:
                      "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    transition:
                      "all 0.25s ease",
                    "&:hover": {
                      transform:
                        "translateY(-3px)",
                      boxShadow:
                        "0 12px 30px rgba(15,23,42,0.08)",
                    },
                  }}
                >
                  <Stack
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    spacing={2.5}
                  >
                    {/* STEP NUMBER */}

                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        flexShrink: 0,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          "linear-gradient(135deg,#EFF6FF,#F5F3FF)",
                        color: "#2563EB",
                      }}
                    >
                      <StepIcon
                        sx={{
                          fontSize: 30,
                        }}
                      />
                    </Box>

                    {/* CONTENT */}

                    <Box
                      sx={{
                        flex: 1,
                      }}
                    >
                      <Stack
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
                        spacing={1}
                        alignItems={{
                          xs: "flex-start",
                          sm: "center",
                        }}
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="h6"
                          fontWeight={800}
                          color="#0F172A"
                        >
                          {step.number}.{" "}
                          {step.title}
                        </Typography>

                        <Chip
                          label={step.status}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            background:
                              step.number === 1
                                ? "#DCFCE7"
                                : "#EFF6FF",
                            color:
                              step.number === 1
                                ? "#166534"
                                : "#1D4ED8",
                          }}
                        />
                      </Stack>

                      <Typography
                        sx={{
                          mt: 1,
                          color: "#64748B",
                          lineHeight: 1.7,
                        }}
                      >
                        {step.description}
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{
                            mb: 0.7,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="#64748B"
                          >
                            Progress
                          </Typography>

                          <Typography
                            variant="caption"
                            fontWeight={700}
                            color="#2563EB"
                          >
                            {step.progress}%
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={
                            step.progress
                          }
                          sx={{
                            height: 7,
                            borderRadius: 5,
                            background:
                              "#E2E8F0",
                            "& .MuiLinearProgress-bar":
                              {
                                borderRadius: 5,
                              },
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>

                  {index <
                    roadmapSteps.length -
                      1 && (
                    <Divider
                      sx={{
                        mt: 3,
                        display: {
                          xs: "none",
                          md: "block",
                        },
                      }}
                    />
                  )}
                </Paper>
              </Grid>
            );
          }
        )}
      </Grid>

      {/* =====================================================
          SKILLS USED
      ===================================================== */}

      {skills.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 4,
            border:
              "1px solid #E2E8F0",
            background: "#FFFFFF",
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <CodeIcon
              sx={{
                color: "#2563EB",
              }}
            />

            <Typography
              variant="h6"
              fontWeight={800}
            >
              Skills Considered
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
          >
            {skills.map(
              (skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                  }}
                />
              )
            )}
          </Stack>
        </Paper>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Typography
        variant="body2"
        sx={{
          mt: 4,
          textAlign: "center",
          color: "#94A3B8",
        }}
      >
        Your roadmap automatically adapts to your
        latest resume analysis.
      </Typography>
    </Box>
  );
}