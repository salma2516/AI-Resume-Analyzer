import {
  Card,
  CardContent,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PsychologyIcon from "@mui/icons-material/Psychology";

export default function InterviewQuestions({
  questions = {},
}) {
  if (!questions) return null;

  const sections = Object.entries(questions);

  if (sections.length === 0) return null;

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
            "linear-gradient(90deg,#7C3AED,#2563EB)",
          color: "white",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
        >
          AI Interview Preparation
        </Typography>

        <Typography>
          Practice questions generated from your resume
        </Typography>
      </Box>

      <CardContent>

        {sections.map(([category, list], index) => (

          <Box
            key={index}
            sx={{ mb: 3 }}
          >

            <Chip
              icon={<PsychologyIcon />}
              label={category
                .replaceAll("_", " ")
                .replace(/\b\w/g, c => c.toUpperCase())}
              color="primary"
              sx={{ mb: 2 }}
            />

            {(list || []).map((question, i) => (

              <Accordion
                key={i}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  "&:before": {
                    display: "none",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography fontWeight="bold">
                    Question {i + 1}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>

                  {typeof question === "string" ? (

                    <Typography>
                      {question}
                    </Typography>

                  ) : (

                    <>
                      <Typography
                        fontWeight="bold"
                        gutterBottom
                      >
                        {question.question}
                      </Typography>

                      {question.answer && (
                        <>
                          <Typography
                            color="primary"
                            fontWeight="bold"
                            sx={{ mt: 2 }}
                          >
                            Suggested Answer
                          </Typography>

                          <Typography
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            {question.answer}
                          </Typography>
                        </>
                      )}
                    </>

                  )}

                </AccordionDetails>

              </Accordion>

            ))}

          </Box>

        ))}

      </CardContent>
    </Card>
  );
}