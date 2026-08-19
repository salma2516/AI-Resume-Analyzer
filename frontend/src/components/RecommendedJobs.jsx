import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Button,
} from "@mui/material";

import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function RecommendedJobs({
  jobs = [],
}) {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return null;
  }

  return (
    <Card
      elevation={6}
      sx={{
        mt: 3,
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {/* Header */}

      <Box
        sx={{
          background:
            "linear-gradient(90deg,#2563EB,#7C3AED)",
          color: "white",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
        >
          Recommended Jobs
        </Typography>

        <Typography>
          AI suggested jobs based on your resume
        </Typography>
      </Box>

      <CardContent>

        <Grid container spacing={3}>

          {jobs.map((job, index) => (

            <Grid
              item
              xs={12}
              md={6}
              key={index}
            >

              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  transition: ".3s",

                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 6,
                  },
                }}
              >

                <CardContent>

                  {/* Job Title */}

                  <Box
                    display="flex"
                    alignItems="center"
                    mb={2}
                  >
                    <WorkIcon color="primary" />

                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ ml: 1 }}
                    >
                      {job.job_role || "Software Engineer"}
                    </Typography>
                  </Box>

                  {/* Company */}

                  <Box
                    display="flex"
                    alignItems="center"
                    mb={1}
                  >
                    <BusinessIcon
                      color="action"
                    />

                    <Typography sx={{ ml: 1 }}>
                      {job.company ||
                        "Top Tech Company"}
                    </Typography>
                  </Box>

                  {/* Location */}

                  <Box
                    display="flex"
                    alignItems="center"
                    mb={1}
                  >
                    <LocationOnIcon
                      color="error"
                    />

                    <Typography sx={{ ml: 1 }}>
                      {job.location ||
                        "Remote"}
                    </Typography>
                  </Box>

                  {/* Salary */}

                  <Box
                    display="flex"
                    alignItems="center"
                    mb={2}
                  >
                    <AttachMoneyIcon
                      color="success"
                    />

                    <Typography sx={{ ml: 1 }}>
                      {job.salary ||
                        "Negotiable"}
                    </Typography>
                  </Box>

                  {/* Match Score */}

                  <Typography
                    fontWeight="bold"
                  >
                    Match Score
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={
                      job.match_score || 0
                    }
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      mt: 1,
                      mb: 1,
                    }}
                  />

                  <Typography
                    color="primary"
                    fontWeight="bold"
                  >
                    {job.match_score || 0}%
                  </Typography>

                  {/* Matched Skills */}

                  <Typography
                    sx={{
                      mt: 2,
                      fontWeight: "bold",
                    }}
                  >
                    Matched Skills
                  </Typography>

                  <Box mt={1}>
                    {(job.matched_skills || []).map(
                      (skill, i) => (
                        <Chip
                          key={i}
                          label={skill}
                          color="success"
                          size="small"
                          sx={{
                            mr: 1,
                            mb: 1,
                          }}
                        />
                      )
                    )}
                  </Box>

                  {/* Missing Skills */}

                  <Typography
                    sx={{
                      mt: 2,
                      fontWeight: "bold",
                    }}
                  >
                    Missing Skills
                  </Typography>

                  <Box mt={1}>
                    {(job.missing_skills || []).map(
                      (skill, i) => (
                        <Chip
                          key={i}
                          label={skill}
                          color="error"
                          size="small"
                          sx={{
                            mr: 1,
                            mb: 1,
                          }}
                        />
                      )
                    )}
                  </Box>

                  {/* Apply Button */}

                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      mt: 3,
                      borderRadius: 3,
                    }}
                  >
                    Apply Now
                  </Button>

                </CardContent>

              </Card>

            </Grid>

          ))}

        </Grid>

      </CardContent>

    </Card>
  );
}