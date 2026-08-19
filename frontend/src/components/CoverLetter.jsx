import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
} from "@mui/material";

function CoverLetter({ coverLetter }) {
  if (!coverLetter) return null;

  let letter = "";

  if (typeof coverLetter === "string") {
    letter = coverLetter;
  } else if (
    typeof coverLetter === "object" &&
    coverLetter.cover_letter
  ) {
    letter = coverLetter.cover_letter;
  }

  if (!letter) return null;

  return (
    <Card elevation={3} sx={{ mt: 3 }}>
      <CardContent>

        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
        >
          AI Generated Cover Letter
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.8,
          }}
        >
          <Typography>
            {letter}
          </Typography>
        </Box>

      </CardContent>
    </Card>
  );
}

export default CoverLetter;