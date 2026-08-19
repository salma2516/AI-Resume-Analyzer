import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function Hero() {
  const scrollToUpload = () => {
    const element = document.getElementById("upload");

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",

        background:
          "linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)",

        borderRadius: {
          xs: 3,
          sm: 3.5,
          md: 4,
        },

        color: "#FFFFFF",

        px: {
          xs: 3,
          sm: 4,
          md: 5,
          lg: 5,
        },

        py: {
          xs: 3.5,
          sm: 4,
          md: 4.5,
        },

        boxShadow:
          "0 15px 40px rgba(37, 99, 235, 0.18)",

        overflow: "hidden",
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={{
          xs: 4,
          md: 4,
          lg: 5,
        }}
        justifyContent="space-between"
        alignItems="stretch"
        sx={{
          width: "100%",
          margin: 0,
        }}
      >
        {/* =====================================================
            LEFT CONTENT
        ===================================================== */}

        <Box
          sx={{
            flex: "1 1 auto",
            width: "100%",
            minWidth: 0,

            display: "flex",
            flexDirection: "column",
            justifyContent: "center",

            pr: {
              md: 1,
              lg: 2,
            },
          }}
        >
          {/* AI CHIP */}

          <Chip
            icon={
              <AutoAwesomeIcon
                sx={{
                  color: "#FFFFFF !important",
                  fontSize: 18,
                }}
              />
            }
            label="AI Powered Resume Analysis"
            sx={{
              alignSelf: "flex-start",

              backgroundColor:
                "rgba(255,255,255,0.14)",

              color: "#FFFFFF",

              border:
                "1px solid rgba(255,255,255,0.20)",

              fontWeight: 500,

              height: 34,

              "& .MuiChip-label": {
                px: 1.5,
              },
            }}
          />

          {/* TITLE */}

          <Typography
            component="h1"
            sx={{
              mt: 2.5,

              mb: 2,

              color: "#FFFFFF",

              fontWeight: 800,

              fontSize: {
                xs: "2.15rem",
                sm: "2.65rem",
                md: "3rem",
                lg: "3.25rem",
              },

              lineHeight: 1.08,

              letterSpacing: "-0.025em",

              maxWidth: {
                xs: "100%",
                md: 650,
                lg: 680,
              },
            }}
          >
            Build a Resume That Gets Interviews
          </Typography>

          {/* DESCRIPTION */}

          <Typography
            sx={{
              mb: 3,

              color:
                "rgba(255,255,255,0.92)",

              fontSize: {
                xs: "0.98rem",
                sm: "1rem",
                md: "1.05rem",
              },

              lineHeight: 1.65,

              maxWidth: {
                xs: "100%",
                md: 650,
                lg: 680,
              },
            }}
          >
            Upload your resume, compare it with a job
            description, receive ATS scoring,
            personalized feedback, career roadmap,
            interview questions, and an AI-generated
            cover letter.
          </Typography>

          {/* ANALYZE BUTTON */}

          <Box>
            <Button
              type="button"
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={scrollToUpload}
              sx={{
                backgroundColor: "#FFFFFF",

                color: "#2563EB",

                px: 3,

                py: 1.3,

                minHeight: 48,

                borderRadius: 2,

                fontWeight: 800,

                fontSize: "0.95rem",

                textTransform: "uppercase",

                boxShadow:
                  "0 8px 20px rgba(0,0,0,0.15)",

                "&:hover": {
                  backgroundColor: "#F8FAFC",

                  color: "#1D4ED8",

                  transform:
                    "translateY(-2px)",

                  boxShadow:
                    "0 10px 24px rgba(0,0,0,0.20)",
                },

                transition:
                  "all 0.2s ease",
              }}
            >
              Analyze Resume
            </Button>
          </Box>
        </Box>

        {/* =====================================================
            RIGHT FEATURE CARDS
        ===================================================== */}

        <Box
          sx={{
            width: {
              xs: "100%",
              md: 300,
              lg: 320,
            },

            maxWidth: {
              xs: "100%",
              md: 320,
            },

            flexShrink: 0,

            display: "flex",

            flexDirection: "column",

            justifyContent: "center",

            gap: 2,
          }}
        >
          {/* =================================================
              ATS CARD
          ================================================= */}

          <Box
            sx={{
              width: "100%",

              minHeight: {
                xs: 130,
                md: 140,
              },

              boxSizing: "border-box",

              backgroundColor:
                "rgba(255,255,255,0.13)",

              border:
                "1px solid rgba(255,255,255,0.15)",

              borderRadius: 3,

              p: 2.5,

              display: "flex",

              flexDirection: "column",

              alignItems: "center",

              justifyContent: "center",

              textAlign: "center",

              backdropFilter:
                "blur(6px)",

              transition:
                "all 0.25s ease",

              "&:hover": {
                backgroundColor:
                  "rgba(255,255,255,0.18)",

                transform:
                  "translateY(-3px)",

                boxShadow:
                  "0 10px 25px rgba(0,0,0,0.10)",
              },
            }}
          >
            <DescriptionIcon
              sx={{
                fontSize: {
                  xs: 38,
                  md: 42,
                },

                mb: 0.8,
              }}
            />

            <Typography
              sx={{
                fontSize: {
                  xs: "1.8rem",
                  md: "2rem",
                },

                lineHeight: 1.1,

                fontWeight: 800,
              }}
            >
              ATS
            </Typography>

            <Typography
              sx={{
                mt: 0.5,

                fontSize: {
                  xs: "0.88rem",
                  md: "0.95rem",
                },

                color:
                  "rgba(255,255,255,0.95)",
              }}
            >
              Smart Resume Scan
            </Typography>
          </Box>

          {/* =================================================
              AI CARD
          ================================================= */}

          <Box
            sx={{
              width: "100%",

              minHeight: {
                xs: 130,
                md: 140,
              },

              boxSizing: "border-box",

              backgroundColor:
                "rgba(255,255,255,0.13)",

              border:
                "1px solid rgba(255,255,255,0.15)",

              borderRadius: 3,

              p: 2.5,

              display: "flex",

              flexDirection: "column",

              alignItems: "center",

              justifyContent: "center",

              textAlign: "center",

              backdropFilter:
                "blur(6px)",

              transition:
                "all 0.25s ease",

              "&:hover": {
                backgroundColor:
                  "rgba(255,255,255,0.18)",

                transform:
                  "translateY(-3px)",

                boxShadow:
                  "0 10px 25px rgba(0,0,0,0.10)",
              },
            }}
          >
            <TrendingUpIcon
              sx={{
                fontSize: {
                  xs: 38,
                  md: 42,
                },

                mb: 0.8,
              }}
            />

            <Typography
              sx={{
                fontSize: {
                  xs: "1.8rem",
                  md: "2rem",
                },

                lineHeight: 1.1,

                fontWeight: 800,
              }}
            >
              AI
            </Typography>

            <Typography
              sx={{
                mt: 0.5,

                fontSize: {
                  xs: "0.88rem",
                  md: "0.95rem",
                },

                color:
                  "rgba(255,255,255,0.95)",
              }}
            >
              Career Insights
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}