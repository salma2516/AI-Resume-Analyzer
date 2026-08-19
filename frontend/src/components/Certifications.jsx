import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
} from "@mui/material";

import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import VerifiedIcon from "@mui/icons-material/Verified";

export default function Certifications({
  certifications = [],
}) {
  if (!certifications || certifications.length === 0) {
    return null;
  }

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
            "linear-gradient(90deg,#F59E0B,#F97316)",
          color: "white",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
        >
          Certifications
        </Typography>

        <Typography>
          Certificates detected from your resume
        </Typography>
      </Box>

      <CardContent>

        <Grid
          container
          spacing={3}
        >

          {certifications.map((certificate, index) => (

            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              key={index}
            >

              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  transition: ".3s",

                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 5,
                  },
                }}
              >

                <CardContent>

                  <Box
                    display="flex"
                    alignItems="center"
                    mb={2}
                  >

                    <WorkspacePremiumIcon
                      color="warning"
                    />

                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ ml: 1 }}
                    >
                      {certificate.title ||
                        certificate.name ||
                        certificate}
                    </Typography>

                  </Box>

                  {certificate.issuer && (

                    <Typography
                      color="text.secondary"
                      gutterBottom
                    >
                      Issued By:
                      {" "}
                      {certificate.issuer}
                    </Typography>

                  )}

                  {certificate.date && (

                    <Typography
                      color="text.secondary"
                    >
                      Date:
                      {" "}
                      {certificate.date}
                    </Typography>

                  )}

                  <Chip
                    icon={<VerifiedIcon />}
                    label="Verified"
                    color="success"
                    sx={{ mt: 2 }}
                  />

                </CardContent>

              </Card>

            </Grid>

          ))}

        </Grid>

      </CardContent>

    </Card>
  );
}