import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from "@mui/material";

function ResumeScore({ resumeScore }) {
  if (!resumeScore) return null;

  const score = resumeScore.score ?? 0;
  const grade = resumeScore.grade ?? "N/A";

  return (
    <Card elevation={3}>
      <CardContent>

        <Typography
          variant="h6"
          gutterBottom
        >
          Resume Score
        </Typography>

        <LinearProgress
          variant="determinate"
          value={score}
          sx={{
            height: 12,
            borderRadius: 5,
            mt: 2,
          }}
        />

        <Typography
          variant="h5"
          align="center"
          sx={{ mt: 2 }}
        >
          {score}/100
        </Typography>

        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Grade: {grade}
        </Typography>

      </CardContent>
    </Card>
  );
}

export default ResumeScore;