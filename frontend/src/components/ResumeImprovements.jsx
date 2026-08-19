import {
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Box,
  Chip,
} from "@mui/material";

import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function ResumeImprovements({
  improvements = {},
}) {
  if (!improvements) return null;

  const sections = Object.entries(improvements);

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
            "linear-gradient(90deg,#9333EA,#2563EB)",
          color: "white",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
        >
          AI Resume Improvements
        </Typography>

        <Typography>
          Personalized suggestions to improve your resume
        </Typography>
      </Box>

      <CardContent>

        <Grid
          container
          spacing={3}
        >

          {sections.map(([section, value]) => {

            let items = [];

            if (Array.isArray(value)) {
              items = value;
            }

            else if (
              value &&
              typeof value === "object"
            ) {
              items =
                value.feedback ||
                value.suggestions ||
                [];
            }

            if (items.length === 0)
              return null;

            return (

              <Grid
                item
                xs={12}
                md={6}
                key={section}
              >

                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    transition: ".3s",

                    "&:hover": {
                      transform:
                        "translateY(-6px)",
                      boxShadow: 5,
                    },
                  }}
                >

                  <CardContent>

                    <Typography
                      variant="h6"
                      color="primary"
                      fontWeight="bold"
                      gutterBottom
                    >
                      {section
                        .replaceAll("_", " ")
                        .replace(
                          /\b\w/g,
                          (c) => c.toUpperCase()
                        )}
                    </Typography>

                    <Divider
                      sx={{ mb: 2 }}
                    />

                    {items.map(
                      (item, index) => (

                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >

                          <CheckCircleIcon
                            color="success"
                            sx={{
                              mr: 1,
                              mt: .3,
                            }}
                          />

                          <Typography>
                            {item}
                          </Typography>

                        </Box>

                      )
                    )}

                    <Chip
                      icon={
                        <AutoFixHighIcon />
                      }
                      label="AI Recommendation"
                      color="primary"
                      sx={{
                        mt: 2,
                      }}
                    />

                  </CardContent>

                </Card>

              </Grid>

            );

          })}

        </Grid>

      </CardContent>

    </Card>
  );
}