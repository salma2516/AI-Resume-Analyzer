import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
} from "@mui/material";

import TimelineIcon from "@mui/icons-material/Timeline";
import SchoolIcon from "@mui/icons-material/School";
import FlagIcon from "@mui/icons-material/Flag";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";

export default function CareerRoadmap({
  roadmap = {},
}) {
  if (!roadmap) return null;

  const learning = Array.isArray(roadmap.recommended_learning)
    ? roadmap.recommended_learning
    : [];

  const phases = Array.isArray(roadmap.roadmap)
    ? roadmap.roadmap
    : [];

  const tips = Array.isArray(roadmap.tips)
    ? roadmap.tips
    : [];

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
          Career Roadmap
        </Typography>

        <Typography>
          AI-generated roadmap for your career
        </Typography>
      </Box>

      <CardContent>

        <Grid container spacing={3}>

          <Grid item xs={12} md={6}>

            <Box
              sx={{
                p: 3,
                bgcolor: "#F8FAFC",
                borderRadius: 3,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
              >
                <FlagIcon
                  sx={{
                    mr: 1,
                    verticalAlign: "middle",
                  }}
                />
                Target Role
              </Typography>

              <Typography sx={{ mt: 2 }}>
                {roadmap.target_role ||
                  "Software Engineer"}
              </Typography>

            </Box>

          </Grid>

          <Grid item xs={12} md={6}>

            <Box
              sx={{
                p: 3,
                bgcolor: "#F8FAFC",
                borderRadius: 3,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
              >
                <TimelineIcon
                  sx={{
                    mr: 1,
                    verticalAlign: "middle",
                  }}
                />
                Current Level
              </Typography>

              <Typography sx={{ mt: 2 }}>
                {roadmap.current_level ||
                  "Beginner"}
              </Typography>

            </Box>

          </Grid>

        </Grid>

        {/* Recommended Learning */}

        {learning.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />

            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
            >
              <SchoolIcon sx={{ mr: 1 }} />
              Recommended Learning
            </Typography>

            <Box mt={2}>
              {learning.map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  color="primary"
                  sx={{
                    mr: 1,
                    mb: 1,
                  }}
                />
              ))}
            </Box>
          </>
        )}

        {/* Timeline */}

        {phases.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />

            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
            >
              Learning Timeline
            </Typography>

            {phases.map((phase, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  mb: 4,
                }}
              >
                {/* Circle */}

                <Box
                  sx={{
                    width: 24,
                    mr: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      bgcolor: "#2563EB",
                      borderRadius: "50%",
                      mt: 1,
                    }}
                  />
                </Box>

                {/* Content */}

                <Box flex={1}>

                  <Typography
                    variant="h6"
                    color="primary"
                    fontWeight="bold"
                  >
                    {phase.phase ||
                      `Phase ${index + 1}`}
                  </Typography>

                  <Typography
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    {phase.title}
                  </Typography>

                  {(phase.tasks || []).map(
                    (task, i) => (
                      <Typography
                        key={i}
                        sx={{
                          mb: 1,
                        }}
                      >
                        • {task}
                      </Typography>
                    )
                  )}

                </Box>

              </Box>
            ))}
          </>
        )}

        {/* Tips */}

        {tips.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />

            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
            >
              <EmojiObjectsIcon
                sx={{ mr: 1 }}
              />
              Career Tips
            </Typography>

            {tips.map((tip, index) => (
              <Typography
                key={index}
                sx={{
                  mb: 2,
                }}
              >
                💡 {tip}
              </Typography>
            ))}
          </>
        )}

      </CardContent>

    </Card>
  );
}