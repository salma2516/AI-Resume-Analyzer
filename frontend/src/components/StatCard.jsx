import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function StatCard({
  title,
  score = 0,
  color = "#2563EB",
}) {
  return (
    <Card
      elevation={6}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        transition: "0.3s",
        cursor: "pointer",

        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 15px 35px rgba(0,0,0,.15)",
        },
      }}
    >
      <Box
        sx={{
          height: 10,
          bgcolor: color,
        }}
      />

      <CardContent>

        <Typography
          variant="subtitle1"
          color="text.secondary"
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
          }}
        >

          <Box>

            <Typography
              variant="h3"
              fontWeight="bold"
              color={color}
            >
              {score}%
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Overall Score
            </Typography>

          </Box>

          <Box
            sx={{
              position: "relative",
            }}
          >
            <CircularProgress
              variant="determinate"
              value={score}
              size={90}
              thickness={5}
              sx={{
                color,
              }}
            />

            <TrendingUpIcon
              sx={{
                position: "absolute",
                top: 28,
                left: 28,
                fontSize: 35,
                color,
              }}
            />

          </Box>

        </Box>

      </CardContent>
    </Card>
  );
}