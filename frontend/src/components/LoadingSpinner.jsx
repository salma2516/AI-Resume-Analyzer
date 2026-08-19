import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";

function LoadingSpinner() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <CircularProgress size={60} />

      <Typography
        sx={{ mt: 3 }}
        variant="h6"
      >
        Analyzing Resume...
      </Typography>

      <Typography color="text.secondary">
        Please wait a few seconds.
      </Typography>
    </Box>
  );
}

export default LoadingSpinner;