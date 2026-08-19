import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Tooltip,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import LightModeIcon from "@mui/icons-material/LightMode";
import SearchIcon from "@mui/icons-material/Search";

export default function Topbar() {
  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        width: "calc(100% - 260px)",
        ml: "260px",
        bgcolor: "#ffffff",
        color: "#111827",
      }}
    >
      <Toolbar>

        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ flexGrow: 1 }}
        >
          AI Resume Analyzer Dashboard
        </Typography>

        <Tooltip title="Search">
          <IconButton color="inherit">
            <SearchIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Theme">
          <IconButton color="inherit">
            <LightModeIcon />
          </IconButton>
        </Tooltip>

        <Box sx={{ ml: 2 }}>
          <Avatar
            sx={{
              bgcolor: "#2563eb",
            }}
          >
            S
          </Avatar>
        </Box>

      </Toolbar>
    </AppBar>
  );
}