import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from "@mui/material";

function ATSScore({ ats }) {
  if (!ats) return null;

  const score = ats.ats_score ?? 0;

  return (
    <Card elevation={3}>
      <CardContent>

        <Typography
          variant="h6"
          gutterBottom
        >
          ATS Score
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

      </CardContent>
    </Card>
  );
}

export default ATSScore;