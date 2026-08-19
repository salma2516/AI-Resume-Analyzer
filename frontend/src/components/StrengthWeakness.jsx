import {
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";

export default function StrengthWeakness({ data = {} }) {
  // Support multiple backend response formats
  const strengths =
    data?.strengths ||
    data?.feedback?.strengths ||
    data?.analysis?.strengths ||
    [];

  const weaknesses =
    data?.weaknesses ||
    data?.feedback?.weaknesses ||
    data?.analysis?.weaknesses ||
    [];

  if (
    !Array.isArray(strengths) &&
    !Array.isArray(weaknesses)
  ) {
    return null;
  }

  return (
    <Card
      elevation={4}
      sx={{
        mt: 3,
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          fontWeight="bold"
          align="center"
          gutterBottom
        >
          💪 Strengths & Weaknesses
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Strengths */}

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                bgcolor: "#E8F5E9",
                borderRadius: 2,
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                color="success.main"
                gutterBottom
              >
                Strengths
              </Typography>

              {strengths.length === 0 ? (
                <Typography color="text.secondary">
                  No strengths available.
                </Typography>
              ) : (
                <List dense>
                  {strengths.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Grid>

          {/* Weaknesses */}

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                bgcolor: "#FFEBEE",
                borderRadius: 2,
                height: "100%",
              }}
            >
              <Typography
                variant="h6"
                color="error.main"
                gutterBottom
              >
                Weaknesses
              </Typography>

              {weaknesses.length === 0 ? (
                <Typography color="text.secondary">
                  No weaknesses available.
                </Typography>
              ) : (
                <List dense>
                  {weaknesses.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}