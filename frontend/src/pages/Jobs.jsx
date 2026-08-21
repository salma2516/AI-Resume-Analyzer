import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ai-resume-analyzer-1-xg6b.onrender.com";

const APPLIED_JOBS_KEY = "appliedJobs";

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9+#./-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(toText).join(" ");
  if (typeof value === "object") return Object.values(value).map(toText).join(" ");
  return String(value);
}

function uniqueStrings(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => {
    if (typeof value === "string") return value.trim();
    if (value && typeof value === "object") {
      return value.name || value.skill || value.title || value.label || "";
    }
    return "";
  }).filter(Boolean))];
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

function getJobId(job) {
  if (job?.job_id != null && String(job.job_id).trim()) return String(job.job_id);
  if (job?.id != null && String(job.id).trim()) return String(job.id);
  return normalize([
    job?.job_role || job?.role || job?.title || "",
    job?.company || "",
    job?.location || "",
    job?.apply_url || job?.apply_link || "",
  ].join("|"));
}

function getAppliedJobs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(APPLIED_JOBS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAppliedJobs(jobs) {
  localStorage.setItem(APPLIED_JOBS_KEY, JSON.stringify(jobs));
}

function isExplicitlyStale(job) {
  const status = normalize(job?.status || job?.job_status || job?.state || "");
  if (["expired", "closed", "inactive", "filled", "removed", "archived"]
    .some((value) => status.includes(value))) return true;

  if (job?.is_active === false || job?.active === false || job?.expired === true) return true;

  const age = normalize(job?.posted_age || job?.age || job?.posted || "");
  const years = age.match(/(\d+)\s*year/);
  const months = age.match(/(\d+)\s*month/);
  const weeks = age.match(/(\d+)\s*week/);
  if (years && Number(years[1]) >= 1) return true;
  if (months && Number(months[1]) >= 1) return true;
  if (weeks && Number(weeks[1]) >= 5) return true;
  return false;
}

function normalizeJob(job) {
  if (!job) return null;
  const role = job.job_role || job.role || job.title || job.position || "Software Engineer";
  const company = String(
    job.company || uniqueStrings(job.companies || [])[0] || ""
  ).trim();
  const applyUrl = String(
    job.apply_url || job.apply_link || job.application_url || job.url || ""
  ).trim();

  const score = Math.max(0, Math.min(100, Math.round(Number(
    job.match_score ?? job.match ?? job.score ?? 0
  ) || 0)));

  return {
    ...job,
    id: getJobId(job),
    job_role: role,
    company,
    companies: uniqueStrings([company, ...(job.companies || [])]),
    match_score: score,
    matched_skills: uniqueStrings(job.matched_skills || job.matchedSkills || []),
    missing_skills: uniqueStrings(job.missing_skills || job.missingSkills || []),
    salary: job.salary || "Salary not disclosed",
    experience: job.experience || "Not specified",
    location: job.location || "India",
    employment_type: job.employment_type || job.type || "Full Time",
    apply_url: applyUrl,
    apply_link: applyUrl,
    source: job.source || "Live job feed",
    posted_age: job.posted_age || "Recent listing",
    description: job.description || "",
    provider_search_links: job.provider_search_links || {},
  };
}

function getBackendRecommendations(analysis) {
  const raw =
    analysis?.recommended_jobs ||
    analysis?.job_recommendations ||
    analysis?.recommendedJobs ||
    analysis?.jobRecommendations ||
    [];

  if (!Array.isArray(raw)) return [];

  const seen = new Set();
  return raw
    .map(normalizeJob)
    .filter(Boolean)
    .filter((job) => {
      if (!job.company || !job.apply_url) return false;
      if (isExplicitlyStale(job)) return false;

      const key = normalize(
        `${job.job_role}|${job.company}|${job.location}|${job.apply_url}`
      );
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const freshnessA = a.live ? 1 : 0;
      const freshnessB = b.live ? 1 : 0;
      return (freshnessB - freshnessA) || (b.match_score - a.match_score);
    })
    .slice(0, 20);
}

function getRoleReason(score) {
  if (score >= 85) return "Excellent alignment with your skills, projects and experience.";
  if (score >= 70) return "Strong alignment with several important requirements in your resume.";
  if (score >= 55) return "Good target role; a few missing skills may reduce your match.";
  return "Possible target role, but building the missing skills will improve your chances.";
}

function ProviderButtons({ job }) {
  const links = job?.provider_search_links || {};
  const items = [
    ["LinkedIn", links.linkedin],
    ["Indeed", links.indeed],
    ["Naukri", links.naukri],
  ];

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {items.map(([name, url]) => url ? (
        <Button
          key={name}
          size="small"
          variant="text"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Search {name} ↗
        </Button>
      ) : null)}
    </Stack>
  );
}

export default function Jobs() {
  const [analysis, setAnalysis] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  const loadAnalysis = () => {
    try {
      const saved = localStorage.getItem("latestResumeAnalysis");
      setAnalysis(saved ? JSON.parse(saved) : null);
    } catch (error) {
      console.error("Jobs page: failed to load resume analysis", error);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
    setAppliedJobs(getAppliedJobs());

    const onResumeUpdate = (event) => {
      if (event?.detail) setAnalysis(event.detail);
      else loadAnalysis();
    };

    const onStorage = () => {
      loadAnalysis();
      setAppliedJobs(getAppliedJobs());
    };

    window.addEventListener("resumeAnalysisUpdated", onResumeUpdate);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("resumeAnalysisUpdated", onResumeUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const recommendations = useMemo(
    () => getBackendRecommendations(analysis),
    [analysis]
  );

  const resumeSkills = useMemo(() => getResumeSkills(analysis), [analysis]);

  const appliedIds = useMemo(
    () => new Set(appliedJobs.map((job) => String(job.id))),
    [appliedJobs]
  );

  const markAsApplied = async (job) => {
    const id = getJobId(job);
    if (!id || appliedIds.has(String(id))) return;

    setBusyId(id);
    setMessage("");

    const record = {
      id,
      job_role: job.job_role,
      company: job.company,
      location: job.location,
      match_score: job.match_score,
      apply_url: job.apply_url,
      source: job.source,
      applied_at: new Date().toISOString(),
    };

    // Always save locally first, so the button works even if the backend session expires.
    const updated = [...appliedJobs, record];
    saveAppliedJobs(updated);
    setAppliedJobs(updated);

    const googleCredential =
      localStorage.getItem("google_credential") ||
      sessionStorage.getItem("google_credential") ||
      "";

    try {
      if (googleCredential.trim()) {
        const response = await fetch(`${API_BASE}/applications/mark-applied`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${googleCredential.trim()}`,
          },
          body: JSON.stringify({
            candidate_name: getCandidateName(analysis),
            job_id: id,
            job_role: job.job_role,
            company: job.company,
            location: job.location,
            match_score: job.match_score,
            apply_url: job.apply_url,
            source: job.source,
          }),
        });

        if (!response.ok) {
          console.warn("Application saved locally but server sync failed", response.status);
          setMessage(`${job.job_role} at ${job.company} is marked Applied locally. Server sync needs a fresh login.`);
        } else {
          setMessage(`${job.job_role} at ${job.company} is marked Applied ✓`);
        }
      } else {
        setMessage(`${job.job_role} at ${job.company} is marked Applied ✓`);
      }
    } catch (error) {
      console.warn("Application server sync failed", error);
      setMessage(`${job.job_role} at ${job.company} is marked Applied locally ✓`);
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Loading live job recommendations...</Typography>
        </Stack>
      </Box>
    );
  }

  if (!analysis) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Alert severity="info">Analyze your resume first. Live job recommendations will appear after analysis.</Alert>
      </Box>
    );
  }

  const bestMatch = recommendations[0];

  return (
    <Box sx={{ minHeight: "100%", p: { xs: 2, md: 4 }, background: "#F8FAFC" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          Job Recommendations
        </Typography>
        <Typography sx={{ mt: 0.5, color: "#64748B" }}>
          Live, recent opportunities matched to {getCandidateName(analysis)}'s latest analyzed resume.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: 4, color: "white", background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}>
        <Typography variant="h5" fontWeight={800}>AI Career Matching</Typography>
        <Typography sx={{ mt: 1, opacity: 0.92 }}>
          Matching uses resume skills, projects, role relevance, experience fit and listing freshness.
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 2, mt: 3 }}>
          <Box sx={{ p: 2, borderRadius: 2, background: "rgba(255,255,255,.15)" }}>
            <Typography variant="caption">LIVE JOBS FOUND</Typography>
            <Typography variant="h5" fontWeight={800}>{recommendations.length}</Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: 2, background: "rgba(255,255,255,.15)" }}>
            <Typography variant="caption">BEST MATCH</Typography>
            <Typography variant="h5" fontWeight={800}>{bestMatch?.match_score || 0}%</Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: 2, background: "rgba(255,255,255,.15)" }}>
            <Typography variant="caption">APPLICATIONS TRACKED</Typography>
            <Typography variant="h5" fontWeight={800}>{appliedJobs.length}</Typography>
          </Box>
        </Box>
      </Paper>

      <Alert severity="info" sx={{ mb: 3 }}>
        Live feed: all-India search. Listings are filtered for recent dates and obvious closed/expired records. Exact availability can still change on the employer's site.
      </Alert>

      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

      {recommendations.length === 0 ? (
        <Alert severity="warning">
          No current listings survived the live-job filters. Re-analyze the resume after starting the updated backend, then refresh this page.
        </Alert>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2,1fr)" }, gap: 3 }}>
          {recommendations.map((job, index) => {
            const isApplied = appliedIds.has(String(getJobId(job)));
            const matched = job.matched_skills.length ? job.matched_skills : resumeSkills.slice(0, 5);
            const missing = job.missing_skills;

            return (
              <Paper key={getJobId(job)} elevation={0} sx={{ p: 3, borderRadius: 4, border: index === 0 ? "2px solid #7C3AED" : "1px solid #E2E8F0", background: "white" }}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Box sx={{ minWidth: 0 }}>
                    {index === 0 && <Chip label="BEST LIVE MATCH" size="small" sx={{ mb: 1, fontWeight: 800, background: "#F3E8FF", color: "#7C3AED" }} />}
                    <Typography variant="h6" fontWeight={800}>{job.job_role}</Typography>
                    <Typography sx={{ mt: 0.5, color: "#0F766E", fontWeight: 700 }}>{job.company}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                      {job.location} • {job.employment_type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      {job.source} • {job.posted_age}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 75, textAlign: "center" }}>
                    <Typography variant="h5" fontWeight={900} color="#2563EB">{job.match_score}%</Typography>
                    <Typography variant="caption" color="text.secondary">Match</Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={job.experience} size="small" variant="outlined" />
                  <Chip label={job.salary} size="small" variant="outlined" />
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.7 }}>
                    <Typography variant="caption" color="text.secondary">Resume match</Typography>
                    <Typography variant="caption" fontWeight={800} color="#2563EB">{job.match_score}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={job.match_score} sx={{ height: 7, borderRadius: 5 }} />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Your Strengths</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {matched.slice(0, 8).map((skill) => <Chip key={skill} label={skill} size="small" sx={{ background: "#ECFDF5", color: "#047857", fontWeight: 600 }} />)}
                  </Stack>
                </Box>

                {missing.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Skills to Improve</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {missing.slice(0, 8).map((skill) => <Chip key={skill} label={skill} size="small" sx={{ background: "#FFF7ED", color: "#C2410C", fontWeight: 600 }} />)}
                    </Stack>
                  </Box>
                )}

                <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: "#F8FAFC" }}>
                  <Typography variant="caption" fontWeight={800} color="#475569">WHY THIS ROLE?</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: "#64748B", lineHeight: 1.6 }}>
                    {getRoleReason(job.match_score)}
                  </Typography>
                </Box>

                {job.description && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Role Overview</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {job.description}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mt: 3 }}>
                  <Typography variant="caption" fontWeight={800} color="#475569">VERIFY ON OTHER JOB BOARDS</Typography>
                  <ProviderButtons job={job} />
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant={index === 0 ? "contained" : "outlined"}
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                  >
                    Apply Now ↗
                  </Button>
                  <Button
                    fullWidth
                    variant={isApplied ? "contained" : "outlined"}
                    color="success"
                    disabled={isApplied || busyId === getJobId(job)}
                    onClick={() => markAsApplied(job)}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
                  >
                    {busyId === getJobId(job) ? "Saving..." : isApplied ? "Applied ✓" : "Mark as Applied"}
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}

      <Typography variant="body2" sx={{ mt: 4, textAlign: "center", color: "#94A3B8" }}>
        Match score is a recommendation score, not a guarantee of interview selection. Job availability must be confirmed on the employer or job-board page.
      </Typography>
    </Box>
  );
}
