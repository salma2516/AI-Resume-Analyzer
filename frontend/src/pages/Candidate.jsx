import { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";

export default function Candidate() {
  const [analysis, setAnalysis] = useState(null);

  // =========================================================
  // LOAD LATEST RESUME ANALYSIS
  // =========================================================

  const loadAnalysis = () => {
    try {
      const savedAnalysis =
        localStorage.getItem("latestResumeAnalysis");

      if (savedAnalysis) {
        setAnalysis(JSON.parse(savedAnalysis));
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
  // INITIAL LOAD + RESUME UPDATE
  // =========================================================

  useEffect(() => {
    loadAnalysis();

    const handleResumeUpdate = (event) => {
      try {
        if (event?.detail) {
          setAnalysis(event.detail);
        } else {
          loadAnalysis();
        }
      } catch (error) {
        console.error(
          "Failed to update candidate profile:",
          error
        );

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
  // NO RESUME
  // =========================================================

  if (!analysis) {
    return (
      <Box
        sx={{
          minHeight: "100%",
          width: "100%",
          p: { xs: 2, md: 4 },
          background: "#F8FAFC",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: 4,
            border: "1px solid #E2E8F0",
            background: "#FFFFFF",
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              fontSize: 34,
              fontWeight: 800,
              background:
                "linear-gradient(135deg,#2563EB,#7C3AED)",
            }}
          >
            👤
          </Avatar>

          <Typography
            variant="h5"
            fontWeight={800}
            color="#0F172A"
          >
            Candidate Profile
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#64748B",
              lineHeight: 1.7,
            }}
          >
            Upload and analyze your resume to
            generate your candidate profile.
          </Typography>
        </Paper>
      </Box>
    );
  }

  // =========================================================
  // CANDIDATE DATA
  // =========================================================

  const candidate = analysis?.candidate || {};

  const name =
    candidate?.name ||
    candidate?.full_name ||
    candidate?.candidate_name ||
    analysis?.candidate_name ||
    "Candidate";

  const email =
    candidate?.email ||
    candidate?.email_address ||
    analysis?.email ||
    "Not available";

  const phone =
    candidate?.phone ||
    candidate?.phone_number ||
    analysis?.phone ||
    "Not available";

  const location =
    candidate?.location ||
    candidate?.city ||
    candidate?.address ||
    "Not available";

  const headline =
    candidate?.headline ||
    candidate?.role ||
    candidate?.designation ||
    candidate?.title ||
    "Professional Candidate";

  const summary =
    analysis?.summary ||
    candidate?.summary ||
    candidate?.professional_summary ||
    "No professional summary was detected.";

  // =========================================================
  // ARRAYS
  // =========================================================

  const education = Array.isArray(
    analysis?.education
  )
    ? analysis.education
    : Array.isArray(candidate?.education)
    ? candidate.education
    : [];

  const experience = Array.isArray(
    analysis?.experience
  )
    ? analysis.experience
    : Array.isArray(candidate?.experience)
    ? candidate.experience
    : [];

  const rawProjects = Array.isArray(analysis?.projects)
    ? analysis.projects
    : Array.isArray(candidate?.projects)
    ? candidate.projects
    : [];

  // Normalize different backend/project-parser formats so every
  // project is rendered consistently.
  const projects = rawProjects.map((project, index) => {
    if (typeof project === "string") {
      return {
        name: `Project ${index + 1}`,
        description: project,
        technologies: [],
      };
    }

    const technologies =
      project?.technologies ||
      project?.technology ||
      project?.tech_stack ||
      project?.techStack ||
      project?.skills ||
      [];

    return {
      name:
        project?.name ||
        project?.project_name ||
        project?.projectName ||
        project?.title ||
        project?.project_title ||
        `Project ${index + 1}`,

      description:
        project?.description ||
        project?.details ||
        project?.summary ||
        project?.objective ||
        "",

      technologies,

      github:
        project?.github ||
        project?.github_url ||
        project?.githubUrl ||
        "",

      liveUrl:
        project?.live_url ||
        project?.liveUrl ||
        project?.demo_url ||
        project?.demoUrl ||
        "",
    };
  });

  const certifications = Array.isArray(
    analysis?.certifications
  )
    ? analysis.certifications
    : Array.isArray(candidate?.certifications)
    ? candidate.certifications
    : [];

  const skills = Array.isArray(
    analysis?.skills
  )
    ? analysis.skills
    : Array.isArray(candidate?.skills)
    ? candidate.skills
    : [];

  // =========================================================
  // STRENGTHS, WEAKNESSES & IMPROVEMENT AREAS
  // =========================================================

  /*
   * Read strengths/weaknesses from every supported backend shape.
   * The Candidate page is intentionally defensive because the API can
   * return these fields at the top level, inside strengths_weakness,
   * resume_feedback, or job_match.
   */

  const toStringList = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .flatMap((item) => {
          if (typeof item === "string") {
            return [item];
          }

          if (item && typeof item === "object") {
            return [
              item.text,
              item.description,
              item.reason,
              item.title,
              item.name,
              item.skill,
              item.message,
            ].filter(Boolean);
          }

          return [];
        })
        .map((item) => String(item).trim())
        .filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(/[\n•;|]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof value === "object") {
      return Object.values(value)
        .flatMap((item) => toStringList(item))
        .filter(Boolean);
    }

    return [];
  };

  const uniqueList = (items) => [
    ...new Map(
      items
        .map((item) => String(item).trim())
        .filter(Boolean)
        .map((item) => [item.toLowerCase(), item])
    ).values(),
  ];

  const strengthsWeakness =
    analysis?.strengths_weakness ||
    analysis?.strengthsWeakness ||
    analysis?.strengths_and_weaknesses ||
    analysis?.strengthsWeaknesses ||
    {};

  const feedback =
    analysis?.resume_feedback ||
    analysis?.resumeFeedback ||
    analysis?.feedback ||
    {};

  const backendStrengths = uniqueList([
    ...toStringList(strengthsWeakness?.strengths),
    ...toStringList(feedback?.strengths),
    ...toStringList(analysis?.strengths),
  ]);

  const backendWeaknesses = uniqueList([
    ...toStringList(strengthsWeakness?.weaknesses),
    ...toStringList(feedback?.weaknesses),
    ...toStringList(analysis?.weaknesses),
  ]);

  const backendImprovementAreas = uniqueList([
    ...toStringList(strengthsWeakness?.improvement_areas),
    ...toStringList(strengthsWeakness?.improvementAreas),
    ...toStringList(feedback?.improvement_areas),
    ...toStringList(feedback?.improvementAreas),
    ...toStringList(analysis?.improvement_areas),
    ...toStringList(analysis?.improvementAreas),
  ]);

  // ---------------------------------------------------------
  // Resume evidence
  // ---------------------------------------------------------

  const skillNames = skills
    .map((skill) =>
      typeof skill === "string"
        ? skill
        : skill?.name ||
          skill?.skill ||
          skill?.title ||
          ""
    )
    .filter(Boolean)
    .map((skill) => skill.toLowerCase().trim());

  const hasSkill = (...names) =>
    names.some((name) =>
      skillNames.some(
        (skill) =>
          skill === name.toLowerCase() ||
          skill.includes(name.toLowerCase())
      )
    );

  const derivedStrengths = [];

  if (hasSkill("python")) {
    derivedStrengths.push(
      "Strong Python development foundation."
    );
  }

  if (
    hasSkill(
      "machine learning",
      "deep learning",
      "tensorflow",
      "scikit-learn",
      "pytorch"
    )
  ) {
    derivedStrengths.push(
      "Hands-on Machine Learning and AI experience."
    );
  }

  if (
    hasSkill(
      "flask",
      "django",
      "fastapi",
      "rest api",
      "rest apis",
      "restful api"
    )
  ) {
    derivedStrengths.push(
      "Backend and REST API development experience."
    );
  }

  if (
    hasSkill(
      "react",
      "react.js",
      "javascript",
      "node.js",
      "express.js"
    )
  ) {
    derivedStrengths.push(
      "Full-stack web development exposure."
    );
  }

  if (
    hasSkill(
      "pandas",
      "numpy",
      "power bi",
      "tableau",
      "data analysis",
      "data analytics"
    )
  ) {
    derivedStrengths.push(
      "Data analysis and data-processing skills."
    );
  }

  if (
    hasSkill(
      "sql",
      "mysql",
      "postgresql",
      "sql server"
    )
  ) {
    derivedStrengths.push(
      "Practical SQL and database experience."
    );
  }

  if (hasSkill("git", "github")) {
    derivedStrengths.push(
      "Version-control and collaborative development experience."
    );
  }

  if (
    hasSkill(
      "arduino",
      "esp8266",
      "iot"
    )
  ) {
    derivedStrengths.push(
      "Practical IoT and hardware-integrated project experience."
    );
  }

  if (experience.length > 0) {
    derivedStrengths.push(
      `Practical experience demonstrated through ${experience.length} resume-listed role(s).`
    );
  }

  if (projects.length > 0) {
    derivedStrengths.push(
      `Strong project portfolio with ${projects.length} resume-listed project(s).`
    );
  }

  const strengths = uniqueList([
    ...backendStrengths,
    ...derivedStrengths,
  ]).slice(0, 8);

  // ---------------------------------------------------------
  // Weaknesses = resume/job gaps, not personal traits
  // ---------------------------------------------------------

  const missingSkills = uniqueList([
    ...toStringList(analysis?.missing_skills),
    ...toStringList(analysis?.missingSkills),
    ...toStringList(analysis?.job_match?.missing_skills),
    ...toStringList(analysis?.job_match?.missingSkills),
    ...toStringList(analysis?.job_recommendations?.[0]?.missing_skills),
    ...toStringList(analysis?.recommended_jobs?.[0]?.missing_skills),
  ]);

  const suggestionText = uniqueList([
    ...toStringList(analysis?.suggestions),
    ...toStringList(analysis?.ai_suggestions),
    ...toStringList(analysis?.aiSuggestions),
    ...toStringList(feedback?.suggestions),
    ...toStringList(feedback?.recommendations),
  ]);

  const derivedWeaknesses = [];

  if (missingSkills.length > 0) {
    derivedWeaknesses.push(
      `Missing job-relevant skills: ${missingSkills
        .slice(0, 8)
        .join(", ")}.`
    );
  }

  if (
    suggestionText.some((item) =>
      item.toLowerCase().includes("quantif")
    )
  ) {
    derivedWeaknesses.push(
      "Some resume achievements need stronger measurable results and numbers."
    );
  }

  if (
    suggestionText.some((item) =>
      item.toLowerCase().includes("deployment")
    )
  ) {
    derivedWeaknesses.push(
      "Major projects would be stronger with live deployment links."
    );
  }

  if (
    !hasSkill("docker") &&
    !hasSkill("aws", "azure", "gcp", "google cloud")
  ) {
    derivedWeaknesses.push(
      "Cloud and container deployment experience is not clearly demonstrated."
    );
  }

  if (
    !hasSkill(
      "fastapi",
      "flask",
      "django",
      "rest api",
      "rest apis"
    )
  ) {
    derivedWeaknesses.push(
      "Backend API development is not strongly represented in the extracted skills."
    );
  }

  const weaknesses = uniqueList([
    ...backendWeaknesses,
    ...derivedWeaknesses,
  ]).slice(0, 8);

  const improvementAreas = uniqueList([
    ...backendImprovementAreas,
    ...missingSkills
      .slice(0, 6)
      .map((skill) => `Strengthen ${skill}.`),
    "Quantify project and internship achievements with measurable outcomes.",
    "Add deployment links and briefly describe the deployment stack for major projects.",
  ]).slice(0, 8);

  /*
   * Never leave the UI empty when the resume itself contains evidence.
   * These are safe fallback statements based only on the parsed resume.
   */
  const finalStrengths =
    strengths.length > 0
      ? strengths
      : [
          "The resume contains structured technical skills and project evidence.",
        ];

  const finalWeaknesses =
    weaknesses.length > 0
      ? weaknesses
      : [
          "No major resume-quality gap was detected from the available analysis.",
        ];

  // =========================================================
  // RESUME METADATA
  // =========================================================


  const resumeFileName =
    analysis?.resume_file_name ||
    localStorage.getItem(
      "latestResumeFileName"
    ) ||
    "Latest uploaded resume";

  const analyzedAt =
    analysis?.analyzed_at ||
    localStorage.getItem(
      "latestResumeAnalysisTime"
    );

  // =========================================================
  // HELPERS
  // =========================================================

  const getText = (value) => {
    if (!value) {
      return "";
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "object") {
      return Object.values(value)
        .filter(Boolean)
        .join(" • ");
    }

    return String(value);
  };

  const formatDate = (date) => {
    if (!date) {
      return "Recently analyzed";
    }

    try {
      return new Date(date).toLocaleString();
    } catch {
      return "Recently analyzed";
    }
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        p: { xs: 2, md: 4 },
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
          Candidate Profile
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color: "#64748B",
          }}
        >
          Your profile is automatically generated
          from your latest analyzed resume.
        </Typography>
      </Box>

      {/* =====================================================
          LATEST RESUME
      ===================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #BFDBFE",
          background: "#EFF6FF",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          justifyContent="space-between"
        >
          <Typography
            variant="body2"
            color="#1E40AF"
            fontWeight={700}
          >
            📄 Latest Resume: {resumeFileName}
          </Typography>

          <Typography
            variant="body2"
            color="#64748B"
          >
            Analyzed: {formatDate(analyzedAt)}
          </Typography>
        </Stack>
      </Paper>

      {/* =====================================================
          PROFILE CARD
      ===================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          background:
            "linear-gradient(135deg,#FFFFFF,#F8FAFC)",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={3}
          alignItems={{
            xs: "center",
            sm: "flex-start",
          }}
        >
          <Avatar
            sx={{
              width: 95,
              height: 95,
              fontSize: "2rem",
              fontWeight: 800,
              background:
                "linear-gradient(135deg,#2563EB,#7C3AED)",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              color="#0F172A"
              textAlign={{
                xs: "center",
                sm: "left",
              }}
            >
              {name}
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "#64748B",
                fontWeight: 600,
                textAlign: {
                  xs: "center",
                  sm: "left",
                },
              }}
            >
              {headline}
            </Typography>

            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              sx={{
                mt: 2,
                justifyContent: {
                  xs: "center",
                  sm: "flex-start",
                },
              }}
            >
              <Chip
                label={`✉ ${email}`}
                variant="outlined"
              />

              {phone !== "Not available" && (
                <Chip
                  label={`☎ ${phone}`}
                  variant="outlined"
                />
              )}

              {location !== "Not available" && (
                <Chip
                  label={`📍 ${location}`}
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* =====================================================
          PROFESSIONAL SUMMARY
      ===================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          background: "#FFFFFF",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          color="#0F172A"
          sx={{ mb: 2 }}
        >
          📝 Professional Summary
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography
          sx={{
            color: "#475569",
            lineHeight: 1.8,
          }}
        >
          {getText(summary)}
        </Typography>
      </Paper>

      {/* =====================================================
          SKILLS
      ===================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          background: "#FFFFFF",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ mb: 2 }}
        >
          💡 Skills
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {skills.length > 0 ? (
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
          >
            {skills
              .slice(0, 40)
              .map((skill, index) => (
                <Chip
                  key={index}
                  label={
                    typeof skill === "string"
                      ? skill
                      : skill?.name ||
                        skill?.skill ||
                        skill?.title ||
                        "Skill"
                  }
                  sx={{
                    background: "#EFF6FF",
                    color: "#1D4ED8",
                    fontWeight: 600,
                  }}
                />
              ))}
          </Stack>
        ) : (
          <Typography color="#64748B">
            No skills detected in the uploaded
            resume.
          </Typography>
        )}
      </Paper>

      {/* =====================================================
          STRENGTHS & WEAKNESSES
      ===================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          background: "#FFFFFF",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          color="#0F172A"
          sx={{ mb: 2 }}
        >
          💪 Strengths & Weaknesses
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* STRENGTHS */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2.5,
                height: "100%",
                borderRadius: 3,
                background: "#ECFDF5",
                border: "1px solid #BBF7D0",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={800}
                color="#166534"
              >
                Strengths
              </Typography>

              {finalStrengths.length > 0 ? (
                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  {finalStrengths.map((item, index) => (
                    <Box
                      key={`strength-${index}`}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#16A34A",
                          fontWeight: 800,
                        }}
                      >
                        ✓
                      </Typography>

                      <Typography
                        variant="body2"
                        color="#14532D"
                        sx={{ lineHeight: 1.65 }}
                      >
                        {getText(item)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography
                  sx={{ mt: 2 }}
                  color="#64748B"
                >
                  No strengths available from the latest
                  resume analysis.
                </Typography>
              )}
            </Box>
          </Grid>

          {/* WEAKNESSES */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2.5,
                height: "100%",
                borderRadius: 3,
                background: "#FFF1F2",
                border: "1px solid #FECDD3",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={800}
                color="#9F1239"
              >
                Weaknesses
              </Typography>

              {finalWeaknesses.length > 0 ? (
                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  {finalWeaknesses.map((item, index) => (
                    <Box
                      key={`weakness-${index}`}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#E11D48",
                          fontWeight: 800,
                        }}
                      >
                        !
                      </Typography>

                      <Typography
                        variant="body2"
                        color="#881337"
                        sx={{ lineHeight: 1.65 }}
                      >
                        {getText(item)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography
                  sx={{ mt: 2 }}
                  color="#64748B"
                >
                  No weaknesses available from the latest
                  resume analysis.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* IMPROVEMENT AREAS */}
        {improvementAreas.length > 0 && (
          <Box
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 3,
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
              color="#1D4ED8"
            >
              🎯 Improvement Areas
            </Typography>

            <Stack spacing={1.1} sx={{ mt: 2 }}>
              {improvementAreas.map((item, index) => (
                <Typography
                  key={`improvement-${index}`}
                  variant="body2"
                  color="#1E3A8A"
                  sx={{ lineHeight: 1.65 }}
                >
                  • {getText(item)}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* =====================================================
          EDUCATION + EXPERIENCE
      ===================================================== */}

      <Grid
        container
        spacing={3}
        sx={{ mb: 3 }}
      >
        {/* EDUCATION */}

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 4,
              border: "1px solid #E2E8F0",
              background: "#FFFFFF",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ mb: 2 }}
            >
              🎓 Education
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {education.length > 0 ? (
              education.map((item, index) => {
                const degree =
                  typeof item === "string"
                    ? item
                    : item?.degree ||
                      item?.qualification ||
                      item?.title ||
                      "Education";

                const institution =
                  typeof item === "object"
                    ? item?.institution ||
                      item?.college ||
                      item?.university ||
                      ""
                    : "";

                const year =
                  typeof item === "object"
                    ? item?.year ||
                      item?.duration ||
                      ""
                    : "";

                return (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      background: "#F8FAFC",
                    }}
                  >
                    <Typography
                      fontWeight={700}
                      color="#0F172A"
                    >
                      {getText(degree)}
                    </Typography>

                    {institution && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          color: "#64748B",
                        }}
                      >
                        {getText(institution)}
                      </Typography>
                    )}

                    {year && (
                      <Typography
                        variant="caption"
                        color="#94A3B8"
                      >
                        {getText(year)}
                      </Typography>
                    )}
                  </Box>
                );
              })
            ) : (
              <Typography color="#64748B">
                No education information detected.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* EXPERIENCE */}

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 4,
              border: "1px solid #E2E8F0",
              background: "#FFFFFF",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ mb: 2 }}
            >
              💼 Professional Experience
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {experience.length > 0 ? (
              experience.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    background: "#F8FAFC",
                  }}
                >
                  <Typography
                    fontWeight={700}
                    color="#0F172A"
                  >
                    {typeof item === "string"
                      ? item
                      : item?.role ||
                        item?.job_role ||
                        item?.title ||
                        "Professional Role"}
                  </Typography>

                  {typeof item === "object" &&
                    item?.company && (
                      <Typography
                        variant="body2"
                        color="#64748B"
                        sx={{ mt: 0.5 }}
                      >
                        {item.company}
                      </Typography>
                    )}

                  {typeof item === "object" &&
                    item?.duration && (
                      <Typography
                        variant="body2"
                        color="#64748B"
                      >
                        {item.duration}
                      </Typography>
                    )}

                  {typeof item === "object" &&
                    item?.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          color: "#64748B",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}
                </Box>
              ))
            ) : (
              <Typography color="#64748B">
                No professional experience detected.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* =====================================================
          PROJECTS
      ===================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          background: "#FFFFFF",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
              color="#0F172A"
            >
              🚀 Projects
            </Typography>

            <Typography
              variant="body2"
              color="#64748B"
              sx={{ mt: 0.5 }}
            >
              Projects detected from your latest analyzed resume.
            </Typography>
          </Box>

          <Chip
            label={`${projects.length} ${
              projects.length === 1 ? "Project" : "Projects"
            }`}
            size="small"
            sx={{
              background: "#EFF6FF",
              color: "#1D4ED8",
              fontWeight: 700,
            }}
          />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {projects.length > 0 ? (
          <Grid container spacing={2.5}>
            {projects.map((project, index) => {
              const technologyList = Array.isArray(
                project.technologies
              )
                ? project.technologies
                : String(project.technologies || "")
                    .split(/[,|]+/)
                    .map((item) => item.trim())
                    .filter(Boolean);

              return (
                <Grid
                  item
                  xs={12}
                  md={6}
                  key={`project-${index}`}
                >
                  <Box
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      background:
                        "linear-gradient(135deg,#F8FAFC,#FFFFFF)",
                      border: "1px solid #E2E8F0",
                      transition: "all .2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow:
                          "0 8px 24px rgba(15,23,42,.08)",
                        borderColor: "#BFDBFE",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          fontSize: 18,
                          fontWeight: 800,
                          background:
                            "linear-gradient(135deg,#2563EB,#7C3AED)",
                        }}
                      >
                        {index + 1}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          fontWeight={800}
                          color="#0F172A"
                          sx={{ lineHeight: 1.3 }}
                        >
                          {project.name}
                        </Typography>

                        {project.description ? (
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1.25,
                              color: "#475569",
                              lineHeight: 1.7,
                            }}
                          >
                            {project.description}
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1.25,
                              color: "#94A3B8",
                              fontStyle: "italic",
                            }}
                          >
                            Project description was not detected.
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    {technologyList.length > 0 && (
                      <Box sx={{ mt: 2.5 }}>
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          color="#64748B"
                          sx={{
                            display: "block",
                            mb: 1,
                            textTransform: "uppercase",
                            letterSpacing: ".04em",
                          }}
                        >
                          Technologies
                        </Typography>

                        <Stack
                          direction="row"
                          flexWrap="wrap"
                          gap={0.8}
                        >
                          {technologyList.map(
                            (technology, technologyIndex) => (
                              <Chip
                                key={technologyIndex}
                                label={technology}
                                size="small"
                                sx={{
                                  background: "#EFF6FF",
                                  color: "#1D4ED8",
                                  fontWeight: 600,
                                }}
                              />
                            )
                          )}
                        </Stack>
                      </Box>
                    )}

                    {(project.github ||
                      project.liveUrl) && (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 2.5 }}
                      >
                        {project.github && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            GitHub
                          </Button>
                        )}

                        {project.liveUrl && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Live Demo
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              background: "#F8FAFC",
            }}
          >
            <Typography
              fontWeight={700}
              color="#334155"
            >
              No projects detected in the latest resume.
            </Typography>

            <Typography
              variant="body2"
              color="#64748B"
              sx={{ mt: 0.75 }}
            >
              Re-analyze the resume after updating the project
              section if the projects are missing.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* =====================================================
          CERTIFICATIONS
      ===================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          background: "#FFFFFF",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ mb: 2 }}
        >
          🏆 Certifications
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {certifications.length > 0 ? (
          <Stack spacing={1.5}>
            {certifications.map(
              (certificate, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: "#F8FAFC",
                    border:
                      "1px solid #E2E8F0",
                  }}
                >
                  <Typography
                    fontWeight={700}
                    color="#0F172A"
                  >
                    {typeof certificate === "string"
                      ? certificate
                      : certificate?.name ||
                        certificate?.title ||
                        "Certification"}
                  </Typography>

                  {typeof certificate ===
                    "object" &&
                    certificate?.issuer && (
                      <Typography
                        variant="body2"
                        color="#64748B"
                        sx={{ mt: 0.5 }}
                      >
                        {certificate.issuer}
                      </Typography>
                    )}

                  {typeof certificate ===
                    "object" &&
                    certificate?.date && (
                      <Typography
                        variant="caption"
                        color="#94A3B8"
                      >
                        {certificate.date}
                      </Typography>
                    )}
                </Box>
              )
            )}
          </Stack>
        ) : (
          <Typography color="#64748B">
            No certifications detected in the
            uploaded resume.
          </Typography>
        )}
      </Paper>

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
        This profile automatically updates when
        you analyze a new resume.
      </Typography>
    </Box>
  );
}