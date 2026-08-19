import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Stack,
  Divider,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CodeIcon from "@mui/icons-material/Code";
import SchoolIcon from "@mui/icons-material/School";

export default function Skills() {
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
        "Error loading resume analysis:",
        error
      );

      setAnalysis(null);
    }
  };

  // =========================================================
  // INITIAL LOAD + RESUME UPDATE LISTENER
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
      analysis?.resume_skills ||
      [];

    if (!Array.isArray(rawSkills)) {
      return [];
    }

    return rawSkills
      .map((skill) => {
        if (typeof skill === "string") {
          return {
            name: skill,
            score: 80,
            category: "Technical",
          };
        }

        return {
          name:
            skill?.name ||
            skill?.skill ||
            skill?.title ||
            "Skill",
          score:
            Number(
              skill?.score ||
                skill?.confidence ||
                skill?.percentage
            ) || 80,
          category:
            skill?.category ||
            "Technical",
        };
      })
      .filter(
        (skill) =>
          skill.name &&
          skill.name !== "Skill"
      );
  }, [analysis]);

  // =========================================================
  // CATEGORY COUNTS
  // =========================================================

  const technicalSkills = skills.filter(
    (skill) =>
      skill.category
        .toLowerCase()
        .includes("technical")
  );

  const softSkills = skills.filter(
    (skill) =>
      skill.category
        .toLowerCase()
        .includes("soft")
  );

  // =========================================================
  // NO RESUME STATE
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
            <AutoAwesomeIcon
              sx={{ fontSize: 40 }}
            />
          </Box>

          <Typography
            variant="h5"
            fontWeight={800}
            color="#0F172A"
          >
            Skill Analysis
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
            Your technical skills, strengths,
            and improvement areas will appear here.
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
          Skills Analysis
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color: "#64748B",
          }}
        >
          Skills extracted from your latest analyzed
          resume.
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
              width: 52,
              height: 52,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "rgba(255,255,255,0.18)",
            }}
          >
            <AutoAwesomeIcon />
          </Box>

          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
            >
              AI Skill Insights
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                opacity: 0.9,
              }}
            >
              Your skills are automatically updated
              whenever you analyze a new resume.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          sm={4}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border:
                "1px solid #E2E8F0",
            }}
          >
            <Typography
              variant="body2"
              color="#64748B"
            >
              Total Skills
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              color="#2563EB"
              sx={{ mt: 1 }}
            >
              {skills.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border:
                "1px solid #E2E8F0",
            }}
          >
            <Typography
              variant="body2"
              color="#64748B"
            >
              Technical Skills
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              color="#7C3AED"
              sx={{ mt: 1 }}
            >
              {technicalSkills.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          sm={4}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border:
                "1px solid #E2E8F0",
            }}
          >
            <Typography
              variant="body2"
              color="#64748B"
            >
              Soft Skills
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              color="#10B981"
              sx={{ mt: 1 }}
            >
              {softSkills.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* =====================================================
          SKILLS LIST
      ===================================================== */}

      <Grid
        container
        spacing={3}
      >
        {/* TECHNICAL SKILLS */}

        <Grid
          item
          xs={12}
          md={8}
        >
          <Paper
            elevation={0}
            sx={{
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
                Detected Skills
              </Typography>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {skills.length === 0 ? (
              <Typography
                color="#64748B"
              >
                No individual skills were returned
                by the current analysis.
              </Typography>
            ) : (
              <Stack spacing={2.5}>
                {skills.map(
                  (skill, index) => (
                    <Box key={index}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <Chip
                            label={skill.name}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              background:
                                "#EFF6FF",
                              color:
                                "#1D4ED8",
                            }}
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="#64748B"
                        >
                          {skill.score}%
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          Math.max(
                            skill.score,
                            0
                          ),
                          100
                        )}
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
                  )
                )}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* =================================================
            SKILL DEVELOPMENT
        ================================================= */}

        <Grid
          item
          xs={12}
          md={4}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
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
              <TrendingUpIcon
                sx={{
                  color: "#7C3AED",
                }}
              />

              <Typography
                variant="h6"
                fontWeight={800}
              >
                Growth Areas
              </Typography>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Typography
              variant="body2"
              color="#64748B"
              sx={{
                lineHeight: 1.7,
                mb: 2,
              }}
            >
              Continue strengthening your strongest
              technical skills and add skills that
              frequently appear in your target roles.
            </Typography>

            <Stack spacing={1.5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "#F8FAFC",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <SchoolIcon
                    sx={{
                      color: "#2563EB",
                    }}
                  />

                  <Typography
                    fontWeight={700}
                  >
                    Continuous Learning
                  </Typography>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "#F8FAFC",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <TrendingUpIcon
                    sx={{
                      color: "#10B981",
                    }}
                  />

                  <Typography
                    fontWeight={700}
                  >
                    Improve Job Readiness
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

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
        Skills automatically refresh after every
        successful resume analysis.
      </Typography>
    </Box>
  );
}