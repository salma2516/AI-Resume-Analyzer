import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from "@mui/material";

function JobMatch({ jobMatch }) {
  if (!jobMatch) return null;

  const score = jobMatch.match_score ?? 0;
  const semanticScore = jobMatch.semantic_score ?? 0;
  const skillScore = jobMatch.skill_score ?? 0;

  return (
    <Card elevation={3}>
      <CardContent>

        <Typography
          variant="h6"
          gutterBottom
        >
          Job Match
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
          {score}%
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Semantic Score: {semanticScore}%
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Skill Match: {skillScore}%
        </Typography>

      </CardContent>
    </Card>
  );
}

export default JobMatch;