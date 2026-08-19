import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";

import Sidebar from "./Sidebar";

const SIDEBAR_WIDTH = 240;

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  /* =========================================================
     MOBILE SIDEBAR
  ========================================================= */

  const [mobileOpen, setMobileOpen] = useState(false);

  /* =========================================================
     APPEARANCE / DARK MODE
  ========================================================= */

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("aiResumeTheme") === "dark";
    } catch {
      return false;
    }
  });

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to AI Resume Analyzer",
      message: "Upload your resume to start your analysis.",
      read: false,
    },
    {
      id: 2,
      title: "Resume analysis ready",
      message: "Your AI-powered resume tools are ready to use.",
      read: false,
    },
    {
      id: 3,
      title: "Career insights available",
      message:
        "Check your dashboard for personalized recommendations.",
      read: false,
    },
  ]);

  /* =========================================================
     PROFILE
  ========================================================= */

  const [profileAnchor, setProfileAnchor] = useState(null);

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  /* =========================================================
     SETTINGS
  ========================================================= */

  const [settingsOpen, setSettingsOpen] = useState(false);

  /* =========================================================
     FANCY LOGOUT CONFIRMATION
  ========================================================= */

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  /* =========================================================
     THEME EFFECT
  ========================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        "aiResumeTheme",
        darkMode ? "dark" : "light"
      );
    } catch {
      // Ignore localStorage errors.
    }

    document.body.style.backgroundColor = darkMode
      ? "#0F172A"
      : "#F5F7FB";

    document.body.style.transition =
      "background-color 0.25s ease";
  }, [darkMode]);

  /* =========================================================
     MOBILE DRAWER
  ========================================================= */

  const handleDrawerToggle = () => {
    setMobileOpen((previous) => !previous);
  };

  /* =========================================================
     APPEARANCE
  ========================================================= */

  const handleThemeToggle = () => {
    setDarkMode((previous) => !previous);
  };

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const markAllNotificationsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );

    setNotificationAnchor(null);
  };

  const markNotificationRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  /* =========================================================
     PROFILE MENU
  ========================================================= */

  const handleProfileOpen = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const handleProfileClick = () => {
    handleProfileClose();
    setProfileDialogOpen(true);
  };

  const handleProfileDialogClose = () => {
    setProfileDialogOpen(false);
  };

  /* =========================================================
     SETTINGS
  ========================================================= */

  const handleSettingsClick = () => {
    handleProfileClose();
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    handleProfileClose();
    setLogoutDialogOpen(true);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = () => {
    try {
      // Clear application authentication/session data.
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("google_credential");
      localStorage.removeItem("google_user");
      localStorage.removeItem("user");
      localStorage.removeItem("aiResumeUser");
      localStorage.removeItem("aiResumeToken");
    } catch {
      // Ignore localStorage errors.
    }

    // Sign out from the Google OAuth session.
    try {
      googleLogout();
    } catch {
      // Continue to the login page even if Google logout fails.
    }

    setLogoutDialogOpen(false);
    setSettingsOpen(false);
    setNotificationAnchor(null);

    // Return to the Google authentication page.
    navigate("/login", { replace: true });
  };

  /* =========================================================
     UNREAD NOTIFICATION COUNT
  ========================================================= */

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  /* =========================================================
     COLORS
  ========================================================= */

  const colors = {
    background: darkMode ? "#0F172A" : "#F5F7FB",
    header: darkMode ? "#111827" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#0F172A",
    secondary: darkMode ? "#CBD5E1" : "#64748B",
    border: darkMode ? "#334155" : "#E2E8F0",
    paper: darkMode ? "#1E293B" : "#FFFFFF",
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        display: "flex",
        backgroundColor: colors.background,
        color: colors.text,
        overflowX: "hidden",
        boxSizing: "border-box",
        transition:
          "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <Box
        sx={{
          width: {
            xs: 0,
            md: SIDEBAR_WIDTH,
          },
          minWidth: {
            xs: 0,
            md: SIDEBAR_WIDTH,
          },
          flexShrink: 0,
        }}
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: "none",
              md: "block",
            },

            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              boxSizing: "border-box",
              border: "none",
              backgroundColor: "#0B1730",
              color: "#FFFFFF",
              overflowX: "hidden",
            },
          }}
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            backgroundColor: "#0B1730",
            color: "#FFFFFF",
            border: "none",
          },
        }}
      >
        <Sidebar />
      </Drawer>

      {/* =====================================================
          MAIN APPLICATION
      ===================================================== */}

      <Box
        sx={{
          flex: 1,
          width: {
            xs: "100%",
            md: `calc(100vw - ${SIDEBAR_WIDTH}px)`,
          },
          maxWidth: {
            xs: "100%",
            md: `calc(100vw - ${SIDEBAR_WIDTH}px)`,
          },
          minWidth: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        {/* ===================================================
            TOP HEADER
        =================================================== */}

        <Box
          component="header"
          sx={{
            width: "100%",
            minHeight: {
              xs: 64,
              md: 68,
            },
            flexShrink: 0,
            backgroundColor: colors.header,
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: {
              xs: 1.5,
              sm: 2.5,
              md: 3.5,
              lg: 4,
            },
            boxSizing: "border-box",
            position: "sticky",
            top: 0,
            zIndex: 1100,
            transition: "background-color 0.25s ease",
          }}
        >
          {/* =================================================
              LEFT HEADER
          ================================================= */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minWidth: 0,
              flex: 1,
            }}
          >
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },
                mr: 1,
                color: colors.text,
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              sx={{
                fontSize: {
                  xs: "0.98rem",
                  sm: "1.1rem",
                  md: "1.25rem",
                },
                fontWeight: 700,
                color: colors.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              AI Resume Analyzer Dashboard
            </Typography>
          </Box>

          {/* =================================================
              RIGHT HEADER
              
              SEARCH REMOVED COMPLETELY
          ================================================= */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: {
                xs: 0.2,
                sm: 0.8,
              },
              flexShrink: 0,
            }}
          >
            {/* NOTIFICATIONS */}

            <Tooltip title="Notifications">
              <IconButton
                onClick={handleNotificationOpen}
                sx={{
                  color: colors.text,
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  max={99}
                >
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* APPEARANCE */}

            <Tooltip
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              <IconButton
                onClick={handleThemeToggle}
                sx={{
                  color: colors.text,
                }}
              >
                {darkMode ? (
                  <LightModeOutlinedIcon />
                ) : (
                  <DarkModeOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>

            {/* PROFILE */}

            <Tooltip title="Profile">
              <IconButton
                onClick={handleProfileOpen}
                sx={{
                  ml: 0.5,
                  p: 0,
                }}
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    background:
                      "linear-gradient(135deg,#2563EB,#7C3AED)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  S
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <Box
          component="main"
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            flex: 1,
            margin: 0,
            boxSizing: "border-box",
            px: {
              xs: 1.5,
              sm: 2,
              md: 3,
              lg: 4,
            },
            py: {
              xs: 2,
              sm: 2.5,
              md: 3,
              lg: 3.5,
            },
            overflowX: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>

      {/* =====================================================
          FANCY LOGOUT CONFIRMATION
      ===================================================== */}

      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: colors.paper,
            color: colors.text,
            boxShadow: darkMode
              ? "0 25px 70px rgba(0,0,0,0.55)"
              : "0 25px 70px rgba(15,23,42,0.25)",
          },
        }}
      >
        {/* Gradient header */}
        <Box
          sx={{
            position: "relative",
            px: 3,
            pt: 4,
            pb: 3,
            textAlign: "center",
            background:
              "linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)",
            color: "#FFFFFF",
          }}
        >
          <IconButton
            onClick={handleLogoutCancel}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "#FFFFFF",
              backgroundColor: "rgba(255,255,255,0.12)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.22)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box
            sx={{
              width: 68,
              height: 68,
              mx: "auto",
              mb: 2,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <LogoutIcon sx={{ fontSize: 34 }} />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Sign out?
          </Typography>

          <Typography
            sx={{
              mt: 0.7,
              opacity: 0.9,
              fontSize: "0.95rem",
            }}
          >
            You're about to leave your AI Resume Analyzer session.
          </Typography>
        </Box>

        <DialogContent
          sx={{
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              backgroundColor: darkMode
                ? "#0F172A"
                : "#F8FAFC",
              border: `1px solid ${colors.border}`,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: colors.text,
                mb: 0.6,
              }}
            >
              Your session will be closed
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: colors.secondary,
                lineHeight: 1.6,
              }}
            >
              You'll be redirected to Google authentication and can sign
              in again whenever you're ready.
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
            gap: 1.2,
          }}
        >
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            fullWidth
            sx={{
              minHeight: 46,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              borderColor: colors.border,
              color: colors.text,
              "&:hover": {
                borderColor: "#94A3B8",
                backgroundColor: darkMode
                  ? "#1E293B"
                  : "#F8FAFC",
              },
            }}
          >
            Stay Signed In
          </Button>

          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            startIcon={<LogoutIcon />}
            fullWidth
            sx={{
              minHeight: 46,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 800,
              background:
                "linear-gradient(135deg,#EF4444,#DC2626)",
              boxShadow:
                "0 8px 20px rgba(220,38,38,0.25)",
              "&:hover": {
                background:
                  "linear-gradient(135deg,#DC2626,#B91C1C)",
                boxShadow:
                  "0 10px 24px rgba(220,38,38,0.32)",
              },
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          NOTIFICATION MENU
      ===================================================== */}

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            width: {
              xs: 320,
              sm: 390,
            },
            maxWidth: "calc(100vw - 24px)",
            mt: 1,
            borderRadius: 2,
            backgroundColor: colors.paper,
            color: colors.text,
            boxShadow:
              "0 12px 35px rgba(15,23,42,0.18)",
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              color: colors.text,
            }}
          >
            Notifications
          </Typography>

          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={markAllNotificationsRead}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Read all
            </Button>
          )}
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <Box
            sx={{
              px: 2,
              py: 3,
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              color={colors.secondary}
            >
              No notifications.
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() =>
                markNotificationRead(notification.id)
              }
              sx={{
                display: "block",
                whiteSpace: "normal",
                py: 1.5,
                px: 2,
                borderLeft: notification.read
                  ? "3px solid transparent"
                  : "3px solid #2563EB",
                backgroundColor: notification.read
                  ? "transparent"
                  : darkMode
                  ? "#172554"
                  : "#EFF6FF",
                "&:hover": {
                  backgroundColor: darkMode
                    ? "#1E293B"
                    : "#F8FAFC",
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: notification.read
                    ? 500
                    : 700,
                  color: colors.text,
                  mb: 0.4,
                }}
              >
                {notification.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: colors.secondary,
                  lineHeight: 1.4,
                }}
              >
                {notification.message}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* =====================================================
          PROFILE MENU
      ===================================================== */}

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={handleProfileClose}
        PaperProps={{
          sx: {
            width: 230,
            mt: 1,
            borderRadius: 2,
            backgroundColor: colors.paper,
            color: colors.text,
            boxShadow:
              "0 12px 35px rgba(15,23,42,0.18)",
          },
        }}
      >
        {/* PROFILE HEADER */}

        <Box
          sx={{
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              color: colors.text,
            }}
          >
            Salma
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: colors.secondary,
            }}
          >
            AI Resume Analyzer
          </Typography>
        </Box>

        <Divider />

        {/* PROFILE */}

        <MenuItem onClick={handleProfileClick}>
          <AccountCircleOutlinedIcon
            sx={{
              mr: 1.5,
              color: colors.secondary,
            }}
          />

          <Typography>Profile</Typography>
        </MenuItem>

        {/* SETTINGS */}

        <MenuItem onClick={handleSettingsClick}>
          <SettingsOutlinedIcon
            sx={{
              mr: 1.5,
              color: colors.secondary,
            }}
          />

          <Typography>Settings</Typography>
        </MenuItem>

        <Divider />

        {/* LOGOUT */}

        <MenuItem
          onClick={handleLogout}
          sx={{
            color: "#DC2626",
          }}
        >
          <LogoutIcon
            sx={{
              mr: 1.5,
            }}
          />

          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* =====================================================
          PROFILE DIALOG
      ===================================================== */}

      <Dialog
        open={profileDialogOpen}
        onClose={handleProfileDialogClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: colors.paper,
            color: colors.text,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          Candidate Profile

          <IconButton
            onClick={handleProfileDialogClose}
            sx={{
              color: colors.text,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              py: 2,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mb: 2,
                fontSize: "2rem",
                fontWeight: 700,
                background:
                  "linear-gradient(135deg,#2563EB,#7C3AED)",
              }}
            >
              S
            </Avatar>

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                color: colors.text,
              }}
            >
              Salma
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: colors.secondary,
              }}
            >
              Aspiring Machine Learning Engineer
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mt: 2,
              borderRadius: 2,
              backgroundColor: darkMode
                ? "#0F172A"
                : "#F8FAFC",
              border: `1px solid ${colors.border}`,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                mb: 1,
                color: colors.text,
              }}
            >
              Profile Information
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: colors.secondary,
                mb: 0.8,
              }}
            >
              Resume Analysis: AI-powered
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: colors.secondary,
                mb: 0.8,
              }}
            >
              Career Focus: Software & AI/ML
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: colors.secondary,
              }}
            >
              Dashboard Status: Active
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            onClick={handleProfileDialogClose}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          SETTINGS DIALOG
      ===================================================== */}

      <Dialog
        open={settingsOpen}
        onClose={handleSettingsClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: colors.paper,
            color: colors.text,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          Settings

          <IconButton
            onClick={handleSettingsClose}
            sx={{
              color: colors.text,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Typography
            sx={{
              fontWeight: 700,
              mb: 1.5,
              color: colors.text,
            }}
          >
            Appearance
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: darkMode
                ? "#0F172A"
                : "#F8FAFC",
              border: `1px solid ${colors.border}`,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={handleThemeToggle}
                />
              }
              label={
                darkMode
                  ? "Dark mode enabled"
                  : "Light mode enabled"
              }
              sx={{
                color: colors.text,
              }}
            />
          </Paper>

          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: colors.secondary,
            }}
          >
            Your appearance preference is saved
            automatically on this device.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            onClick={handleSettingsClose}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}