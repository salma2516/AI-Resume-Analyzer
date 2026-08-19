import { useState } from "react";

import {
  Box,
  Grid,
  Typography,
  Fade,
} from "@mui/material";

import DashboardLayout from "../components/DashboardLayout";
import Hero from "../components/Hero";
import ResumeUpload from "../components/ResumeUpload";

import StatCard from "../components/StatCard";
import Analytics from "../components/Analytics";
import CandidateProfile from "../components/CandidateProfile";

import Skills from "../components/Skills";
import Experience from "../components/Experience";
import Projects from "../components/Projects";
import Certifications from "../components/Certifications";

import ResumeFeedback from "../components/ResumeFeedback";
import ResumeImprovements from "../components/ResumeImprovements";
import StrengthWeakness from "../components/StrengthWeakness";
import AISuggestions from "../components/AISuggestions";

import RecommendedJobs from "../components/RecommendedJobs";
import CareerRoadmap from "../components/CareerRoadmap";
import InterviewQuestions from "../components/InterviewQuestions";

import CoverLetter from "../components/CoverLetter";
import DownloadPDF from "../components/DownloadPDF";

/* =========================================================
   NORMALIZE STRENGTH / WEAKNESS DATA
========================================================= */

function toList(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === "string") return [item];

        if (item && typeof item === "object") {
          return [
            item.text,
            item.description,
            item.reason,
            item.title,
            item.name,
          ].filter(Boolean);
        }

        return [];
      })
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n•;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeStrengthWeakness(result) {
  const direct =
    result?.strengths_weakness ||
    result?.strengthsWeakness ||
    result?.strengths_and_weaknesses ||
    {};

  const feedback =
    result?.resume_feedback || {};

  let strengths = toList(
    direct.strengths || feedback.strengths
  );

  let weaknesses = toList(
    direct.weaknesses || feedback.weaknesses
  );

  let improvementAreas = toList(
    direct.improvement_areas ||
      direct.improvementAreas ||
      feedback.improvement_areas ||
      feedback.improvementAreas
  );

  const skills = Array.isArray(result?.skills)
    ? result.skills
        .map((skill) =>
          typeof skill === "string"
            ? skill
            : skill?.name ||
              skill?.skill ||
              skill?.title ||
              ""
        )
        .filter(Boolean)
    : [];

  const skillNames = new Set(
    skills.map((skill) => skill.toLowerCase())
  );

  const hasSkill = (...names) =>
    names.some((name) =>
      skillNames.has(name.toLowerCase())
    );

  const projects = Array.isArray(result?.projects)
    ? result.projects
    : [];

  const experience = Array.isArray(result?.experience)
    ? result.experience
    : [];

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
      "scikit-learn"
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
      "tableau"
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

  if (
    hasSkill("git", "github")
  ) {
    derivedStrengths.push(
      "Version-control and collaborative development experience."
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

  if (strengths.length === 0) {
    strengths = [...new Set(derivedStrengths)];
  }

  const jobMatch = result?.job_match || {};

  const missingSkills = toList(
    jobMatch?.missing_skills ||
      result?.missing_skills
  );

  const derivedWeaknesses = [];

  if (missingSkills.length > 0) {
    derivedWeaknesses.push(
      `Missing job-relevant skills: ${missingSkills
        .slice(0, 8)
        .join(", ")}.`
    );
  }

  if (
    !hasSkill(
      "docker",
      "kubernetes"
    )
  ) {
    derivedWeaknesses.push(
      "Containerization and orchestration are not clearly demonstrated."
    );
  }

  if (
    !hasSkill(
      "aws",
      "azure",
      "gcp",
      "google cloud"
    )
  ) {
    derivedWeaknesses.push(
      "Cloud deployment experience is not clearly demonstrated."
    );
  }

  if (missingSkills.length > 0) {
    improvementAreas.push(
      `Prioritize these job-relevant skills: ${missingSkills
        .slice(0, 8)
        .join(", ")}.`
    );
  }

  improvementAreas.push(
    "Quantify project and internship achievements with measurable outcomes."
  );

  improvementAreas.push(
    "Add deployment links and briefly describe the deployment stack for major projects."
  );

  if (weaknesses.length === 0) {
    weaknesses = [...new Set(derivedWeaknesses)];
  }

  if (strengths.length === 0) {
    strengths = [
      "The resume contains structured technical profile evidence.",
    ];
  }

  if (weaknesses.length === 0) {
    weaknesses = [
      "No major resume-quality gap was detected from the available analysis.",
    ];
  }

  return {
    strengths: [...new Set(strengths)],
    weaknesses: [...new Set(weaknesses)],
    improvement_areas: [...new Set(improvementAreas)],
  };
}

export default function Dashboard() {
  const [result, setResult] = useState(null);

  const strengthWeaknessData =
    normalizeStrengthWeakness(result);

  /*
   * Merge the new strengths/weaknesses into resume feedback
   * so BOTH the AI Resume Feedback card and the dedicated
   * Strengths & Weaknesses card receive the same data.
   */
  const feedbackData = {
    ...(result?.resume_feedback || {}),
    ...strengthWeaknessData,
  };

  return (
    <DashboardLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "none",
          minWidth: 0,
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <Hero />

        <Box
          id="upload"
          sx={{
            width: "100%",
            mt: 3,
          }}
        >
          <ResumeUpload setResult={setResult} />
        </Box>

        {result && (
          <Fade in timeout={700}>
            <Box
              sx={{
                width: "100%",
                mt: 4,
                pb: 6,
              }}
            >
              <Typography
                component="h2"
                sx={{
                  fontSize: {
                    xs: "1.5rem",
                    md: "1.8rem",
                  },
                  fontWeight: 800,
                  color: "#0F172A",
                  mb: 3,
                }}
              >
                Resume Analysis Dashboard
              </Typography>

              <Grid
                container
                spacing={2.5}
                sx={{
                  width: "100%",
                  margin: 0,
                }}
              >
                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title="ATS Score"
                    score={
                      result?.ats_score?.ats_score ??
                      result?.ats?.score ??
                      0
                    }
                    color="#2563EB"
                  />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title="Resume Score"
                    score={
                      result?.resume_score?.score ??
                      0
                    }
                    color="#10B981"
                  />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <StatCard
                    title="Job Match"
                    score={Math.round(
                      result?.job_match?.match_score ??
                      0
                    )}
                    color="#7C3AED"
                  />
                </Grid>

                <Grid item xs={12} lg={3}>
                  <Box
                    sx={{
                      height: "100%",
                      minHeight: 150,
                    }}
                  >
                    <Analytics
                      result={result}
                      compact
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ width: "100%", mt: 3 }}>
                <Analytics result={result} />
              </Box>

              <Box sx={{ width: "100%", mt: 3 }}>
                <CandidateProfile
                  candidate={result?.candidate || {}}
                  summary={result?.summary || ""}
                />
              </Box>

              <Grid
                container
                spacing={3}
                sx={{
                  width: "100%",
                  margin: 0,
                  mt: 0,
                }}
              >
                <Grid item xs={12} lg={6}>
                  <Skills
                    skills={result?.skills || []}
                  />
                </Grid>

                <Grid item xs={12} lg={6}>
                  <Experience
                    experience={result?.experience || []}
                  />
                </Grid>
              </Grid>

              <Grid
                container
                spacing={3}
                sx={{
                  width: "100%",
                  margin: 0,
                  mt: 0,
                }}
              >
                <Grid item xs={12} lg={6}>
                  <Projects
                    projects={result?.projects || []}
                  />
                </Grid>

                <Grid item xs={12} lg={6}>
                  <Certifications
                    certifications={
                      result?.certifications || []
                    }
                  />
                </Grid>
              </Grid>

              <Grid
                container
                spacing={3}
                sx={{
                  width: "100%",
                  margin: 0,
                  mt: 0,
                }}
              >
                <Grid item xs={12} lg={6}>
                  <ResumeFeedback
                    feedback={feedbackData}
                  />
                </Grid>

                <Grid item xs={12} lg={6}>
                  <ResumeImprovements
                    improvements={
                      result?.resume_improvements || {}
                    }
                  />
                </Grid>
              </Grid>

              <Grid
                container
                spacing={3}
                sx={{
                  width: "100%",
                  margin: 0,
                  mt: 0,
                }}
              >
                <Grid item xs={12} lg={6}>
                  <StrengthWeakness
                    data={strengthWeaknessData}
                  />
                </Grid>

                <Grid item xs={12} lg={6}>
                  <AISuggestions
                    suggestions={
                      result?.resume_improvements ||
                      result?.ai_suggestions ||
                      {}
                    }
                  />
                </Grid>
              </Grid>

              <Box sx={{ width: "100%", mt: 3 }}>
                <RecommendedJobs
                  jobs={
                    result?.recommended_jobs ||
                    result?.job_recommendations ||
                    []
                  }
                />
              </Box>

              <Box sx={{ width: "100%", mt: 3 }}>
                <CareerRoadmap
                  roadmap={
                    result?.career_roadmap || {}
                  }
                />
              </Box>

              <Box sx={{ width: "100%", mt: 3 }}>
                <InterviewQuestions
                  questions={
                    result?.interview_questions || {}
                  }
                />
              </Box>

              <Box sx={{ width: "100%", mt: 3 }}>
                <CoverLetter
                  coverLetter={
                    result?.cover_letter?.cover_letter ||
                    result?.cover_letter ||
                    ""
                  }
                />
              </Box>

              <Box
                sx={{
                  width: "100%",
                  mt: 3,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <DownloadPDF
                  pdf={result?.pdf_report || ""}
                />
              </Box>
            </Box>
          </Fade>
        )}

        <Box
          component="footer"
          sx={{
            width: "100%",
            mt: 6,
            py: 4,
            px: 3,
            textAlign: "center",
            background:
              "linear-gradient(135deg,#0F172A,#1E293B)",
            color: "#FFFFFF",
            borderRadius: {
              xs: 2,
              md: 3,
            },
          }}
        >
          <Typography
            variant="h5"
            fontWeight={800}
          >
            AI Resume Analyzer
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#CBD5E1",
            }}
          >
            Analyze • Improve • Match • Get Hired
          </Typography>

          <Typography
            sx={{
              mt: 1.5,
              color: "#94A3B8",
              fontSize: "0.9rem",
            }}
          >
            Powered by React • FastAPI • Gemini AI •
            Material UI
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#64748B",
              fontSize: "0.8rem",
            }}
          >
            © 2026 AI Resume Analyzer. All Rights
            Reserved.
          </Typography>
        </Box>
      </Box>
    </DashboardLayout>
  );
}