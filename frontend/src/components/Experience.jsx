import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

function Experience({ experience }) {
  // ---------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------

  if (!Array.isArray(experience) || experience.length === 0) {
    return (
      <Card
        elevation={3}
        sx={{
          height: "100%",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <WorkIcon color="primary" />

            <Typography
              variant="h5"
              fontWeight="bold"
            >
              Experience
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography color="text.secondary">
            No work experience found in the resume.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // ---------------------------------------------------------
  // Experience card
  // ---------------------------------------------------------

  return (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        >
          <WorkIcon color="primary" />

          <Typography
            variant="h5"
            fontWeight="bold"
          >
            Experience
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Experience List */}

        {experience.map((item, index) => {
          // -------------------------------------------------
          // Job title
          // -------------------------------------------------

          const jobTitle =
            item?.job_title ||
            item?.role ||
            item?.position ||
            item?.title ||
            "Professional Experience";

          // -------------------------------------------------
          // Company
          // -------------------------------------------------

          const company =
            item?.company ||
            item?.organization ||
            item?.employer ||
            "";

          // -------------------------------------------------
          // Duration
          // -------------------------------------------------

          const duration =
            item?.duration ||
            item?.period ||
            item?.dates ||
            "";

          // -------------------------------------------------
          // Description
          // -------------------------------------------------

          let descriptions =
            item?.description ||
            item?.responsibilities ||
            item?.details ||
            [];

          // Convert string -> array
          if (!Array.isArray(descriptions)) {
            descriptions = descriptions
              ? [descriptions]
              : [];
          }

          // Convert values safely to strings
          descriptions = descriptions
            .map((description) => {
              if (
                typeof description === "string"
              ) {
                return description.trim();
              }

              if (
                typeof description === "object" &&
                description !== null
              ) {
                return (
                  description.text ||
                  description.description ||
                  description.value ||
                  ""
                );
              }

              return String(description);
            })
            .filter(Boolean);

          return (
            <Box
              key={`${jobTitle}-${company}-${index}`}
              sx={{
                position: "relative",
                p: 2.5,

                mb:
                  index === experience.length - 1
                    ? 0
                    : 2,

                border:
                  "1px solid #E2E8F0",

                borderRadius: 2,

                backgroundColor:
                  "#F8FAFC",

                transition:
                  "all 0.25s ease",

                "&:hover": {
                  transform:
                    "translateY(-3px)",

                  boxShadow:
                    "0 8px 20px rgba(15,23,42,0.08)",

                  borderColor:
                    "#2563EB",
                },
              }}
            >
              {/* Job Title */}

              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                sx={{
                  lineHeight: 1.3,
                }}
              >
                {jobTitle}
              </Typography>

              {/* Company */}

              {company && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                    mt: 1,
                  }}
                >
                  <BusinessIcon
                    sx={{
                      fontSize: 18,
                      color: "#64748B",
                    }}
                  />

                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    {company}
                  </Typography>
                </Box>
              )}

              {/* Duration */}

              {duration && (
                <Chip
                  icon={
                    <CalendarMonthIcon
                      sx={{
                        fontSize: 18,
                      }}
                    />
                  }
                  label={duration}
                  size="small"
                  variant="outlined"
                  sx={{
                    mt: 1.5,
                    fontWeight: 500,
                  }}
                />
              )}

              {/* Responsibilities */}

              {descriptions.length > 0 && (
                <List
                  dense
                  disablePadding
                  sx={{
                    mt: 1.5,
                  }}
                >
                  {descriptions.map(
                    (description, descIndex) => (
                      <ListItem
                        key={descIndex}
                        disableGutters
                        sx={{
                          alignItems:
                            "flex-start",
                          py: 0.5,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box
                              component="span"
                              sx={{
                                display: "flex",
                                gap: 1,
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  color: "#2563EB",
                                  fontWeight: "bold",
                                }}
                              >
                                •
                              </Box>

                              <Box
                                component="span"
                              >
                                {description}
                              </Box>
                            </Box>
                          }
                          primaryTypographyProps={{
                            color:
                              "text.secondary",
                            lineHeight: 1.6,
                            fontSize:
                              "0.95rem",
                          }}
                        />
                      </ListItem>
                    )
                  )}
                </List>
              )}

              {/* No description */}

              {descriptions.length === 0 &&
                !company &&
                !duration && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    No additional details
                    available.
                  </Typography>
                )}
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default Experience;