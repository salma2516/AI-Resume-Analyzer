import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
} from "@mui/material";

import PsychologyIcon from "@mui/icons-material/Psychology";
import DescriptionIcon from "@mui/icons-material/Description";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import WorkIcon from "@mui/icons-material/Work";

function About() {
  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>

      <Typography
        variant="h3"
        align="center"
        fontWeight="bold"
        gutterBottom
      >
        About AI Resume Analyzer
      </Typography>

      <Typography
        align="center"
        color="text.secondary"
        sx={{ mb: 5 }}
      >
        AI Resume Analyzer helps candidates improve resumes,
        calculate ATS score, compare resumes with job descriptions,
        generate interview questions, career roadmaps,
        cover letters and personalized AI suggestions.
      </Typography>

      <Grid container spacing={3}>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>

              <Avatar sx={{ bgcolor: "primary.main", mb: 2 }}>
                <DescriptionIcon />
              </Avatar>

              <Typography variant="h5">
                Resume Parsing
              </Typography>

              <Typography sx={{ mt: 2 }}>
                Automatically extracts candidate
                information, skills, education,
                experience, projects and certifications.
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>

              <Avatar sx={{ bgcolor: "success.main", mb: 2 }}>
                <AnalyticsIcon />
              </Avatar>

              <Typography variant="h5">
                ATS Analysis
              </Typography>

              <Typography sx={{ mt: 2 }}>
                Calculates ATS score, Resume score,
                Job Match percentage and missing skills.
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>

              <Avatar sx={{ bgcolor: "warning.main", mb: 2 }}>
                <PsychologyIcon />
              </Avatar>

              <Typography variant="h5">
                AI Suggestions
              </Typography>

              <Typography sx={{ mt: 2 }}>
                Provides resume improvements,
                interview questions and career roadmap.
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>

              <Avatar sx={{ bgcolor: "secondary.main", mb: 2 }}>
                <WorkIcon />
              </Avatar>

              <Typography variant="h5">
                Job Recommendations
              </Typography>

              <Typography sx={{ mt: 2 }}>
                Suggests suitable jobs based on
                skills and experience.
              </Typography>

            </CardContent>
          </Card>
        </Grid>

      </Grid>

    </Container>
  );
}

export default About;