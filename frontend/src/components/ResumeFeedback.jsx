import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
  LinearProgress,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

export default function ResumeFeedback({
  feedback = {},
}) {
  if (!feedback) return null;

  const strengths = Array.isArray(feedback.strengths)
    ? feedback.strengths
    : [];

  const weaknesses = Array.isArray(feedback.weaknesses)
    ? feedback.weaknesses
    : [];

  const suggestions = Array.isArray(feedback.feedback)
    ? feedback.feedback
    : [];

  const overall =
    feedback.overall_score ||
    feedback.score ||
    80;

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
            "linear-gradient(90deg,#0EA5E9,#2563EB)",
          color: "white",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
        >
          AI Resume Feedback
        </Typography>

        <Typography>
          Intelligent analysis of your resume
        </Typography>
      </Box>

      <CardContent>

        {/* Overall Score */}

        <Typography
          variant="h6"
          gutterBottom
        >
          Overall Resume Quality
        </Typography>

        <LinearProgress
          variant="determinate"
          value={overall}
          sx={{
            height: 12,
            borderRadius: 6,
            mb: 1,
          }}
        />

        <Typography
          color="primary"
          fontWeight="bold"
        >
          {overall}%
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid
          container
          spacing={3}
        >

          {/* Strengths */}

          <Grid item xs={12} md={6}>

            <Typography
              variant="h6"
              color="success.main"
              gutterBottom
            >
              Strengths
            </Typography>

            {strengths.length > 0 ? (

              strengths.map((item, index) => (

                <Chip
                  key={index}
                  icon={<CheckCircleIcon />}
                  label={item}
                  color="success"
                  sx={{
                    mr: 1,
                    mb: 1,
                  }}
                />

              ))

            ) : (

              <Typography color="text.secondary">
                No strengths identified.
              </Typography>

            )}

          </Grid>

          {/* Weaknesses */}

          <Grid item xs={12} md={6}>

            <Typography
              variant="h6"
              color="error.main"
              gutterBottom
            >
              Weaknesses
            </Typography>

            {weaknesses.length > 0 ? (

              weaknesses.map((item, index) => (

                <Chip
                  key={index}
                  icon={<WarningAmberIcon />}
                  label={item}
                  color="error"
                  sx={{
                    mr: 1,
                    mb: 1,
                  }}
                />

              ))

            ) : (

              <Typography color="text.secondary">
                No weaknesses identified.
              </Typography>

            )}

          </Grid>

        </Grid>

        {/* Suggestions */}

        {suggestions.length > 0 && (

          <>
            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h6"
              gutterBottom
            >
              AI Suggestions
            </Typography>

            {suggestions.map((item, index) => (

              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <LightbulbIcon
                  color="warning"
                  sx={{ mr: 2 }}
                />

                <Typography>
                  {item}
                </Typography>

              </Box>

            ))}

          </>

        )}

      </CardContent>
    </Card>
  );
}