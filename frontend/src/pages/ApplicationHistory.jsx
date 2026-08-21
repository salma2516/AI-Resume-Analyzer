import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  LinearProgress,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

const API_ROOT =
  import.meta.env.VITE_API_URL || "https://ai-resume-analyzer-1-xg6b.onrender.com";

const API_BASE = API_ROOT.replace(/\/+$/, "").endsWith("/api")
  ? API_ROOT.replace(/\/+$/, "")
  : `${API_ROOT.replace(/\/+$/, "")}/api`;

/*
 * =========================================================
 * JOBS PAGE
 * =========================================================
 *
 * This page reads the latest analyzed resume from:
 * localStorage -> "latestResumeAnalysis"
 *
 * It prefers backend-generated recommendations:
 *   recommended_jobs
 *
 * It also supports the older key:
 *   job_recommendations
 *
 * The backend recommendation format is expected to contain:
 *   job_role
 *   match_score
 *   matched_skills
 *   missing_skills
 *   salary
 *   experience
 *   category
 *   description
 *   companies
 *
 * Every displayed real job must have its own apply_url.
 * No generic LinkedIn/company fallback is generated.
 * =========================================================
 */


/* =========================================================
   SAFE HELPERS
========================================================= */

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w+#./-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toText).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value).map(toText).join(" ");
  }

  return String(value);
}

const APPLIED_JOBS_KEY = "appliedJobs";

function getAppliedJobs() {
  try {
    const saved = localStorage.getItem(APPLIED_JOBS_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Jobs page: unable to load applied jobs:", error);
    return [];
  }
}

function getJobId(job) {
  if (!job) {
    return "";
  }

  // Prefer a backend-provided ID when available.
  if (job.job_id !== undefined && job.job_id !== null && String(job.job_id).trim()) {
    return String(job.job_id);
  }

  if (job.id !== undefined && job.id !== null && String(job.id).trim()) {
    return String(job.id);
  }

  // Stable fallback for listings that do not have an explicit ID.
  return normalize(
    [
      job.job_role || job.role || job.title || "",
      job.company || "",
      job.location || "",
      job.apply_url || job.apply_link || "",
    ].join("|")
  );
}

function isExplicitlyStale(job) {
  if (!job) {
    return true;
  }

  const status = normalize(job.status);

  // Only reject statuses that clearly mean the listing is no longer active.
  if (
    status === "closed" ||
    status === "expired" ||
    status === "inactive" ||
    status === "removed" ||
    status === "filled"
  ) {
    return true;
  }

  if (job.is_active === false) {
    return true;
  }

  // If the backend provides a numeric age, hide listings older than 90 days.
  const ageText = String(job.posted_age || "").toLowerCase();
  const ageMatch = ageText.match(/(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months|year|years)/);

  if (ageMatch) {
    const amount = Number(ageMatch[1]);
    const unit = ageMatch[2];

    let days = amount;

    if (unit.startsWith("week")) {
      days = amount * 7;
    } else if (unit.startsWith("month")) {
      days = amount * 30;
    } else if (unit.startsWith("year")) {
      days = amount * 365;
    }

    if (days > 90) {
      return true;
    }
  }

  return false;
}

function uniqueStrings(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values
        .map((value) => {
          if (typeof value === "string") {
            return value.trim();
          }

          if (value && typeof value === "object") {
            return (
              value.name ||
              value.skill ||
              value.title ||
              value.label ||
              ""
            );
          }

          return "";
        })
        .filter(Boolean)
    ),
  ];
}

function getCandidateName(analysis) {
  return (
    analysis?.candidate?.name ||
    analysis?.candidate_name ||
    analysis?.name ||
    "your profile"
  );
}

function getResumeSkills(analysis) {
  return uniqueStrings(
    analysis?.skills ||
      analysis?.candidate?.skills ||
      []
  );
}

function getResumeText(analysis) {
  return normalize(
    [
      analysis?.summary,
      analysis?.candidate,
      analysis?.skills,
      analysis?.education,
      analysis?.experience,
      analysis?.projects,
      analysis?.certifications,
    ]
      .map(toText)
      .join(" ")
  );
}


/* =========================================================
   FALLBACK ROLE DEFINITIONS
   =========================================================
   These are used only if the backend did not return
   recommended_jobs. The primary source is always the
   backend-generated recommendations.
========================================================= */

const FALLBACK_ROLES = [
  {
    title: "Machine Learning Engineer",
    category: "AI / Machine Learning",
    skills: [
      "Python",
      "Machine Learning",
      "TensorFlow",
      "Scikit-learn",
      "Pandas",
      "NumPy",
      "Deep Learning",
    ],
  },
  {
    title: "Python Developer",
    category: "Software & AI",
    skills: [
      "Python",
      "FastAPI",
      "Flask",
      "SQL",
      "REST APIs",
      "Git",
    ],
  },
  {
    title: "Software Engineer",
    category: "Technology",
    skills: [
      "Python",
      "Data Structures",
      "Algorithms",
      "SQL",
      "Git",
      "Problem Solving",
    ],
  },
  {
    title: "Data Analyst",
    category: "Analytics & Technology",
    skills: [
      "Python",
      "Pandas",
      "SQL",
      "Data Analysis",
      "Statistics",
      "Power BI",
    ],
  },
  {
    title: "Data Scientist",
    category: "Data & AI",
    skills: [
      "Python",
      "Pandas",
      "NumPy",
      "Machine Learning",
      "SQL",
      "Statistics",
    ],
  },
  {
    title: "AI Engineer",
    category: "Artificial Intelligence",
    skills: [
      "Python",
      "TensorFlow",
      "PyTorch",
      "OpenCV",
      "NLP",
      "Machine Learning",
    ],
  },
  {
    title: "Backend Developer",
    category: "Software",
    skills: [
      "Python",
      "FastAPI",
      "Flask",
      "SQL",
      "REST APIs",
      "Docker",
    ],
  },
];


/* =========================================================
   FALLBACK MATCHING
========================================================= */

function calculateFallbackRecommendations(analysis) {
  const resumeSkills = getResumeSkills(analysis);
  const resumeSkillText = normalize(
    resumeSkills.join(" ")
  );
  const resumeText = getResumeText(analysis);

  return FALLBACK_ROLES
    .map((role) => {
      const matched = role.skills.filter((skill) => {
        const value = normalize(skill);

        return (
          resumeSkillText.includes(value) ||
          resumeText.includes(value)
        );
      });

      const missing = role.skills.filter(
        (skill) => !matched.includes(skill)
      );

      const score =
        role.skills.length > 0
          ? Math.round(
              (matched.length / role.skills.length) * 100
            )
          : 0;

      return {
        job_role: role.title,
        match_score: score,
        matched_skills: matched,
        missing_skills: missing,
        salary: "Not specified",
        experience: "0-2 Years",
        category: role.category,
        description: `A ${role.title} role aligned with the skills and experience found in the analyzed resume.`,
        companies: [],
      };
    })
    .filter((job) => job.match_score > 0)
    .sort(
      (a, b) => b.match_score - a.match_score
    )
    .slice(0, 6);
}


/* =========================================================
   NORMALIZE BACKEND JOB
========================================================= */

function normalizeBackendJob(job) {
  const role =
    job?.job_role ||
    job?.role ||
    job?.title ||
    job?.position ||
    "Software Engineer";

  const matchedSkills = uniqueStrings(
    job?.matched_skills ||
      job?.matchedSkills ||
      job?.matched_skills_list ||
      []
  );

  const missingSkills = uniqueStrings(
    job?.missing_skills ||
      job?.missingSkills ||
      []
  );

  let score = Number(
    job?.match_score ??
      job?.match ??
      job?.score ??
      0
  );

  if (!Number.isFinite(score)) {
    score = 0;
  }

  score = Math.max(
    0,
    Math.min(100, Math.round(score))
  );

  const company =
    typeof job?.company === "string"
      ? job.company.trim()
      : uniqueStrings(
          job?.companies || []
        )[0] || "";

  const companies = uniqueStrings([
    company,
    ...(Array.isArray(job?.companies)
      ? job.companies
      : []),
  ]);

  const applyUrl =
    job?.apply_url ||
    job?.apply_link ||
    job?.application_url ||
    job?.url ||
    "";

  return {
    ...job,
    job_role: role,
    match_score: score,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    salary:
      job?.salary ||
      "Not specified",
    experience:
      job?.experience ||
      "0-2 Years",
    category:
      job?.category ||
      "Technology",
    description:
      job?.description ||
      "",
    company,
    companies,
    location:
      job?.location ||
      "Location not specified",
    employment_type:
      job?.employment_type ||
      job?.type ||
      "Full Time",
    apply_url: applyUrl,
    apply_link: applyUrl,
    source:
      job?.source ||
      "",
    source_url:
      job?.source_url ||
      applyUrl,
    posted_date:
      job?.posted_date ||
      job?.created ||
      "",
    posted_age:
      job?.posted_age ||
      "",
    status:
      job?.status ||
      "active",
    is_active:
      job?.is_active !== false,
  };
}


/* =========================================================
   BACKEND RECOMMENDATIONS
========================================================= */

function getBackendRecommendations(analysis) {
  const raw =
    analysis?.recommended_jobs ||
    analysis?.job_recommendations ||
    analysis?.recommendedJobs ||
    analysis?.jobRecommendations ||
    [];

  if (!Array.isArray(raw)) {
    return [];
  }

  const seen = new Set();

  return raw
    .map(normalizeBackendJob)
    .filter(Boolean)
    .filter((job) => {
      // Never display a recommendation without a company and real apply URL.
      if (!job.company || !job.apply_url) return false;

      // Hide listings that are explicitly expired/closed/very old.
      if (isExplicitlyStale(job)) return false;

      // Prevent duplicate job cards.
      const key = normalize(
        `${job.job_role}|${job.company}|${job.location}|${job.apply_url}`
      );

      if (seen.has(key)) return false;
      seen.add(key);

      return true;
    })
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10);
}


/* =========================================================
   APPLY LINK
========================================================= */

function buildApplyLink(job) {
  /*
   * IMPORTANT:
   * Never generate one generic/fake application URL.
   * Every real job record must carry its own apply_url.
   */
  return (
    job?.apply_url ||
    job?.apply_link ||
    ""
  );
}


/* =========================================================
   ROLE REASON
========================================================= */

function getRoleReason(job) {
  const score = Number(
    job?.match_score || 0
  );

  if (score >= 85) {
    return "Strong alignment with your resume profile, skills and project experience.";
  }

  if (score >= 70) {
    return "Good alignment with several skills and experience areas in your analyzed resume.";
  }

  if (score >= 50) {
    return "A realistic target role, but strengthening the missing skills would improve your match.";
  }

  return "This role may become a stronger option after you build the missing skills.";
}


/* =========================================================
   COMPONENT
========================================================= */

export default function Jobs() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applyMessage, setApplyMessage] = useState("");

  /* -------------------------------------------------------
     LOAD LATEST ANALYSIS
  ------------------------------------------------------- */

  const loadAnalysis = () => {
    try {
      const saved = localStorage.getItem(
        "latestResumeAnalysis"
      );

      if (!saved) {
        setAnalysis(null);
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(saved);

      setAnalysis(parsed);
      setLoading(false);
    } catch (error) {
      console.error(
        "Jobs page: unable to load latest resume analysis:",
        error
      );

      setAnalysis(null);
      setLoading(false);
    }
  };


  /* -------------------------------------------------------
     LISTEN FOR NEW RESUME ANALYSIS
  ------------------------------------------------------- */

  useEffect(() => {
    loadAnalysis();
    setAppliedJobs(getAppliedJobs());

    const handleResumeUpdate = (event) => {
      if (event?.detail) {
        setAnalysis(event.detail);
        setLoading(false);
      } else {
        loadAnalysis();
      }
    };

    const handleStorageUpdate = () => {
      loadAnalysis();
      setAppliedJobs(getAppliedJobs());
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


  /* -------------------------------------------------------
     GENERATE JOBS
  ------------------------------------------------------- */

  const recommendations = useMemo(() => {
    if (!analysis) {
      return [];
    }

    const backendJobs =
      getBackendRecommendations(analysis);

    if (backendJobs.length > 0) {
      return backendJobs;
    }

    /*
     * Do not fabricate jobs when the backend has no real listings.
     * The backend jobs.json is the source of real listings.
     */
    return [];
  }, [analysis]);


  /* -------------------------------------------------------
     STRENGTHS / WEAKNESSES
  ------------------------------------------------------- */

  const resumeSkills = useMemo(
    () => getResumeSkills(analysis),
    [analysis]
  );

  const resumeSkillSet = useMemo(
    () =>
      new Set(
        resumeSkills.map(normalize)
      ),
    [resumeSkills]
  );


  const isApplied = (job) => {
    const id = getJobId(job);
    return appliedJobs.some((item) => item.id === id);
  };

  const markAsApplied = async (job) => {
    if (isApplied(job)) return;

    const candidateName =
      analysis?.candidate?.name ||
      analysis?.candidate_name ||
      "Candidate";

    // The application API now authenticates the logged-in
    // Google user from the Google ID token. Your Login.jsx
    // stores that credential as "google_credential".
    const googleCredential =
      localStorage.getItem("google_credential") || "";

    if (!googleCredential.trim()) {
      setApplyMessage(
        "Your Google login session is missing. Please sign out and sign in with Google again."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/applications/mark-applied`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${googleCredential.trim()}`,
          },
          body: JSON.stringify({
            candidate_name: candidateName,
            job_id: String(getJobId(job)),
            job_role: job.job_role,
            company: job.company,
            location: job.location,
            match_score: job.match_score,
            apply_url: job.apply_url,
            source: job.source,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to track this application."
        );
      }

      const current = getAppliedJobs();

      if (
        !current.some(
          (item) => item.id === getJobId(job)
        )
      ) {
        const updated = [
          ...current,
          {
            id: getJobId(job),
            job_role: job.job_role,
            company: job.company,
            location: job.location,
            match_score: job.match_score,
            apply_url: job.apply_url,
            applied_at: new Date().toISOString(),
          },
        ];

        localStorage.setItem(
          APPLIED_JOBS_KEY,
          JSON.stringify(updated)
        );

        setAppliedJobs(updated);
      }

      const loggedInUser = JSON.parse(
        localStorage.getItem("aiResumeUser") || "{}"
      );

      const loggedInEmail =
        loggedInUser?.email || "your email";

      if (data?.email?.sent) {
        setApplyMessage(
          `Application tracked for ${job.job_role} at ${job.company}. Confirmation email sent to ${loggedInEmail}.`
        );
      } else {
        setApplyMessage(
          `Application tracked for ${job.job_role} at ${job.company}. Email confirmation is not configured yet.`
        );
      }

      window.setTimeout(
        () => setApplyMessage(""),
        6000
      );
    } catch (error) {
      console.error(
        "Application tracking error:",
        error
      );

      setApplyMessage(
        error?.message ||
          "Could not track the application."
      );
    }
  };

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          background: "#F8FAFC",
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />
          <Typography color="#64748B">
            Loading your latest resume analysis...
          </Typography>
        </Stack>
      </Box>
    );
  }


  /* -------------------------------------------------------
     NO RESUME
  ------------------------------------------------------- */

  if (!analysis) {
    return (
      <Box
        sx={{
          minHeight: "100%",
          p: { xs: 2, md: 4 },
          background: "#F8FAFC",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            textAlign: "center",
            border: "1px solid #E2E8F0",
          }}
        >
          <Typography
            variant="h5"
            fontWeight={800}
            color="#0F172A"
          >
            Job Recommendations
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#64748B",
              maxWidth: 650,
              mx: "auto",
            }}
          >
            Upload and analyze your resume first.
            Job recommendations will then be
            calculated from your actual skills,
            experience, education and projects.
          </Typography>
        </Paper>
      </Box>
    );
  }


  const candidateName =
    getCandidateName(analysis);

  const bestMatch =
    recommendations[0];

  const latestProjects = Array.isArray(
    analysis?.projects
  )
    ? analysis.projects
    : [];


  /* -------------------------------------------------------
     PAGE
  ------------------------------------------------------- */

  return (
    <Box
      sx={{
        minHeight: "100%",
        p: { xs: 2, md: 4 },
        background: "#F8FAFC",
      }}
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={800}
          color="#0F172A"
        >
          Job Recommendations
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color: "#64748B",
          }}
        >
          Jobs matched to {candidateName}'s
          latest analyzed resume.
        </Typography>
      </Box>


      {/* ===================================================
          AI MATCHING SUMMARY
      =================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          borderRadius: 4,
          color: "#FFFFFF",
          background:
            "linear-gradient(135deg,#2563EB,#7C3AED)",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={800}
        >
          AI Career Matching
        </Typography>

        <Typography
          sx={{
            mt: 1,
            opacity: 0.92,
            lineHeight: 1.7,
          }}
        >
          Recommendations are based on the
          latest analyzed resume, including
          skills, professional profile,
          experience, projects and
          certifications.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 2,
            mt: 3,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background:
                "rgba(255,255,255,0.15)",
            }}
          >
            <Typography variant="caption">
              JOBS FOUND
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
            >
              {recommendations.length}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background:
                "rgba(255,255,255,0.15)",
            }}
          >
            <Typography variant="caption">
              BEST MATCH
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
            >
              {bestMatch?.match_score || 0}%
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background:
                "rgba(255,255,255,0.15)",
            }}
          >
            <Typography variant="caption">
              APPLICATIONS TRACKED
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ mt: 0.2 }}
            >
              {appliedJobs.length}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {applyMessage && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {applyMessage}
        </Alert>
      )}


      {/* ===================================================
          NO JOBS
      =================================================== */}

      {recommendations.length === 0 && (
        <Alert severity="info">
          No active job recommendations with a
          company and real application URL were found.
          Expired or clearly stale listings are hidden.
        </Alert>
      )}


      {/* ===================================================
          JOB CARDS
      =================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: 3,
        }}
      >
        {recommendations.map(
          (job, index) => {
            const matched = uniqueStrings(
              job.matched_skills
            );

            const missing = uniqueStrings(
              job.missing_skills
            );

            /*
             * Strengths are the skills that the
             * recommendation says already match.
             */
            const strengths =
              matched.length > 0
                ? matched
                : resumeSkills.filter((skill) =>
                    job.job_role
                      ? normalize(
                          toText(job)
                        ).includes(
                          normalize(skill)
                        )
                      : false
                  );

            /*
             * Weaknesses are the skills required
             * by the role but missing from the
             * analyzed resume.
             */
            const weaknesses =
              missing.length > 0
                ? missing
                : [];

            const applyLink =
              buildApplyLink(job);

            return (
              <Paper
                key={`${job.job_role}-${index}`}
                elevation={0}
                sx={{
                  height: "100%",
                  p: 3,
                  borderRadius: 4,
                  border:
                    index === 0
                      ? "2px solid #7C3AED"
                      : "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  transition:
                    "all 0.25s ease",
                  "&:hover": {
                    transform:
                      "translateY(-4px)",
                    boxShadow:
                      "0 14px 35px rgba(15,23,42,0.10)",
                  },
                }}
              >

                {/* -----------------------------------------
                    TITLE
                ----------------------------------------- */}

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={2}
                >
                  <Box sx={{ minWidth: 0 }}>
                    {index === 0 && (
                      <Chip
                        label="BEST MATCH"
                        size="small"
                        sx={{
                          mb: 1,
                          fontWeight: 800,
                          background: "#F3E8FF",
                          color: "#7C3AED",
                        }}
                      />
                    )}

                    <Typography
                      variant="h6"
                      fontWeight={800}
                      color="#0F172A"
                    >
                      {job.job_role}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.7,
                        color: "#0F766E",
                        fontWeight: 700,
                      }}
                    >
                      {job.company || "Company not specified"}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.3,
                        color: "#64748B",
                      }}
                    >
                      {job.location || "Location not specified"}
                      {" • "}
                      {job.employment_type || "Full Time"}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        color: "#94A3B8",
                      }}
                    >
                      Source: {job.source || "Job listing"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      minWidth: 75,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight={900}
                      color="#2563EB"
                    >
                      {job.match_score}%
                    </Typography>

                    <Typography
                      variant="caption"
                      color="#64748B"
                    >
                      Match
                    </Typography>
                  </Box>
                </Stack>


                <Divider sx={{ my: 2 }} />


                {/* -----------------------------------------
                    DETAILS
                ----------------------------------------- */}

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    label={
                      job.experience ||
                      "0-2 Years"
                    }
                    size="small"
                    variant="outlined"
                  />

                  <Chip
                    label={
                      job.salary ||
                      "Salary not specified"
                    }
                    size="small"
                    variant="outlined"
                  />

                  {job.company && (
                    <Chip
                      label={job.company}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>


                {/* -----------------------------------------
                    MATCH PROGRESS
                ----------------------------------------- */}

                <Box sx={{ mt: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 0.7 }}
                  >
                    <Typography
                      variant="caption"
                      color="#64748B"
                    >
                      Resume Match
                    </Typography>

                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color="#2563EB"
                    >
                      {job.match_score}%
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={job.match_score}
                    sx={{
                      height: 7,
                      borderRadius: 5,
                    }}
                  />
                </Box>


                {/* -----------------------------------------
                    STRENGTHS
                ----------------------------------------- */}

                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    sx={{ mb: 1 }}
                  >
                    Your Strengths
                  </Typography>

                  {strengths.length > 0 ? (
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1}
                    >
                      {strengths
                        .slice(0, 8)
                        .map((skill) => (
                          <Chip
                            key={`strength-${skill}`}
                            label={skill}
                            size="small"
                            sx={{
                              background:
                                "#ECFDF5",
                              color:
                                "#047857",
                              fontWeight: 600,
                            }}
                          />
                        ))}
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      color="#94A3B8"
                    >
                      No direct strengths were
                      returned for this role.
                    </Typography>
                  )}
                </Box>


                {/* -----------------------------------------
                    WEAKNESSES / MISSING SKILLS
                ----------------------------------------- */}

                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    sx={{ mb: 1 }}
                  >
                    Skills to Improve
                  </Typography>

                  {weaknesses.length > 0 ? (
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1}
                    >
                      {weaknesses
                        .slice(0, 8)
                        .map((skill) => (
                          <Chip
                            key={`missing-${skill}`}
                            label={skill}
                            size="small"
                            sx={{
                              background:
                                "#FFF7ED",
                              color:
                                "#C2410C",
                              fontWeight: 600,
                            }}
                          />
                        ))}
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      color="#047857"
                    >
                      No major missing skills were
                      identified for this role.
                    </Typography>
                  )}
                </Box>


                {/* -----------------------------------------
                    WHY THIS ROLE
                ----------------------------------------- */}

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    background: "#F8FAFC",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    color="#475569"
                  >
                    WHY THIS ROLE?
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      color: "#64748B",
                      lineHeight: 1.6,
                    }}
                  >
                    {getRoleReason(job)}
                  </Typography>
                </Box>


                {/* -----------------------------------------
                    JOB DESCRIPTION
                ----------------------------------------- */}

                {job.description && (
                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                      sx={{ mb: 1 }}
                    >
                      Role Overview
                    </Typography>

                    <Typography
                      variant="body2"
                      color="#64748B"
                      sx={{
                        lineHeight: 1.6,
                        display:
                          "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient:
                          "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {job.description}
                    </Typography>
                  </Box>
                )}


                {/* -----------------------------------------
                    PROJECT RELEVANCE
                ----------------------------------------- */}

                {latestProjects.length > 0 && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      borderRadius: 2,
                      background: "#F5F3FF",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color="#6D28D9"
                    >
                      RESUME PROJECT SIGNAL
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        color: "#6B21A8",
                        lineHeight: 1.6,
                      }}
                    >
                      Your analyzed resume contains
                      project experience that is
                      considered when generating
                      recommendations for this role.
                    </Typography>
                  </Box>
                )}


                {/* -----------------------------------------
                    APPLY
                ----------------------------------------- */}

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mt: 3 }}
                >
                  <Button
                    fullWidth
                    variant={
                      index === 0
                        ? "contained"
                        : "outlined"
                    }
                    href={applyLink || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={!applyLink}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 800,
                    }}
                  >
                    Apply Now ↗
                  </Button>

                  <Button
                    fullWidth
                    variant={
                      isApplied(job)
                        ? "contained"
                        : "outlined"
                    }
                    color="success"
                    disabled={isApplied(job)}
                    onClick={() => markAsApplied(job)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 800,
                    }}
                  >
                    {isApplied(job)
                      ? "Applied ✓"
                      : "Mark as Applied"}
                  </Button>
                </Stack>
              </Paper>
            );
          }
        )}
      </Box>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <Typography
        variant="body2"
        sx={{
          mt: 4,
          textAlign: "center",
          color: "#94A3B8",
        }}
      >
        Recommendations automatically update
        whenever you analyze a new resume. Expired
        listings are hidden when freshness data is available.
      </Typography>
    </Box>
  );
}