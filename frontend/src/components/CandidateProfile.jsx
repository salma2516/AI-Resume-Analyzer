import {
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Box,
  Chip,
  Divider,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";

export default function CandidateProfile({
  candidate = {},
  summary = "",
}) {
  return (
    <Card
      elevation={6}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          background:
            "linear-gradient(90deg,#2563EB,#7C3AED)",
          color: "white",
          p: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Candidate Profile
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={4} alignItems="center">

          {/* Avatar */}
          <Grid item xs={12} md={3}>
            <Box
              display="flex"
              justifyContent="center"
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "#2563EB",
                  fontSize: 40,
                }}
              >
                {candidate?.name
                  ? candidate.name.charAt(0).toUpperCase()
                  : <PersonIcon fontSize="large" />}
              </Avatar>
            </Box>
          </Grid>

          {/* Candidate Details */}
          <Grid item xs={12} md={9}>
            <Typography variant="h4" fontWeight="bold">
              {candidate?.name || "Candidate Name"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>

              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <EmailIcon color="primary" />
                  <Typography sx={{ ml: 1 }}>
                    {candidate?.email || "Not Available"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <PhoneIcon color="primary" />
                  <Typography sx={{ ml: 1 }}>
                    {candidate?.phone || "Not Available"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <LocationOnIcon color="primary" />
                  <Typography sx={{ ml: 1 }}>
                    {candidate?.location || "Not Available"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <SchoolIcon color="primary" />
                  <Typography sx={{ ml: 1 }}>
                    {candidate?.education || "Not Available"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <WorkIcon color="primary" />
                  <Typography sx={{ ml: 1 }}>
                    {candidate?.designation ||
                      "Fresher / Student"}
                  </Typography>
                </Box>
              </Grid>

            </Grid>
          </Grid>

        </Grid>

        {summary && (
          <>
            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
            >
              Professional Summary
            </Typography>

            <Typography color="text.secondary">
              {summary}
            </Typography>
          </>
        )}

        {candidate?.skills &&
          Array.isArray(candidate.skills) &&
          candidate.skills.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />

              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
              >
                Key Skills
              </Typography>

              <Box
                display="flex"
                flexWrap="wrap"
                gap={1}
              >
                {candidate.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </>
          )}
      </CardContent>
    </Card>
  );
}