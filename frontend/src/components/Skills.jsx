import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  LinearProgress,
} from "@mui/material";

import PsychologyIcon from "@mui/icons-material/Psychology";

export default function Skills({ skills = [] }) {
  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <Card
      elevation={6}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
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
          Technical Skills
        </Typography>

        <Typography>
          Skills extracted from resume
        </Typography>
      </Box>

      <CardContent>

        <Grid
          container
          spacing={2}
        >

          {skills.map((skill, index) => (

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={index}
            >

              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  transition: ".3s",

                  "&:hover": {
                    transform: "translateY(-5px)",
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

                    <PsychologyIcon
                      color="primary"
                    />

                    <Typography
                      sx={{ ml: 1 }}
                      fontWeight="bold"
                    >
                      {skill}
                    </Typography>

                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={
                      75 +
                      Math.floor(
                        Math.random() * 25
                      )
                    }
                    sx={{
                      height: 8,
                      borderRadius: 5,
                    }}
                  />

                  <Chip
                    label="Verified"
                    color="success"
                    size="small"
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