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

function readStoredUser() {
  try {
    for (const key of ["aiResumeUser", "google_user", "user"]) {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Unable to read stored user:", error);
  }

  return null;
}

function getUserName(user) {
  if (!user || typeof user !== "object") {
    return "User";
  }

  const name =
    user.name ||
    user.displayName ||
    user.full_name ||
    user.fullName ||
    user.given_name ||
    user.first_name ||
    "";

  return String(name).trim() || "User";
}

function getUserEmail(user) {
  if (!user || typeof user !== "object") {
    return "";
  }

  return String(
    user.email || user.emailAddress || ""
  ).trim();
}

function getUserPicture(user) {
  if (!user || typeof user !== "object") {
    return "";
  }

  return (
    user.profile_picture ||
    user.profilePicture ||
    user.picture ||
    user.image ||
    ""
  );
}

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(
    () => readStoredUser()
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("aiResumeTheme") === "dark";
    } catch {
      return false;
    }
  });

  const [notificationAnchor, setNotificationAnchor] =
    useState(null);

  const [profileAnchor, setProfileAnchor] =
    useState(null);

  const [profileDialogOpen, setProfileDialogOpen] =
    useState(false);

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [logoutDialogOpen, setLogoutDialogOpen] =
    useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to AI Resume Analyzer",
      message:
        "Upload your resume to start your analysis.",
      read: false,
    },
    {
      id: 2,
      title: "Resume analysis ready",
      message:
        "Your AI-powered resume tools are ready to use.",
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

  /*
   * IMPORTANT FIX
   *
   * These values MUST be declared inside the component.
   * This fixes:
   *
   * ReferenceError: userName is not defined
   */
  const userName = getUserName(currentUser);
  const userEmail = getUserEmail(currentUser);
  const userPicture = getUserPicture(currentUser);
  const userInitial =
    userName.slice(0, 1).toUpperCase() || "U";

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  const colors = {
    background: darkMode ? "#0F172A" : "#F5F7FB",
    header: darkMode ? "#111827" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#0F172A",
    secondary: darkMode ? "#CBD5E1" : "#64748B",
    border: darkMode ? "#334155" : "#E2E8F0",
    paper: darkMode ? "#1E293B" : "#FFFFFF",
  };

  /*
   * Keep user information synchronized if another
   * component updates localStorage.
   */
  useEffect(() => {
    const syncUser = () => {
      setCurrentUser(readStoredUser());
    };

    window.addEventListener("storage", syncUser);

    syncUser();

    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  /*
   * Save theme preference.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        "aiResumeTheme",
        darkMode ? "dark" : "light"
      );
    } catch {
      // Ignore storage errors.
    }

    document.body.style.backgroundColor =
      colors.background;

    document.body.style.transition =
      "background-color 0.25s ease";
  }, [darkMode, colors.background]);

  /*
   * Logout
   */
  const handleLogoutConfirm = () => {
    try {
      [
        "isLoggedIn",
        "google_credential",
        "google_user",
        "user",
        "aiResumeUser",
        "aiResumeToken",
      ].forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch {
      // Continue to login even if storage cleanup fails.
    }

    try {
      googleLogout();
    } catch {
      // Continue to login if Google logout fails.
    }

    setCurrentUser(null);
    setLogoutDialogOpen(false);
    setSettingsOpen(false);
    setProfileDialogOpen(false);
    setProfileAnchor(null);
    setNotificationAnchor(null);
    setMobileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        backgroundColor: colors.background,
        color: colors.text,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* DESKTOP SIDEBAR */}

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

      {/* MOBILE SIDEBAR */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
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

      {/* MAIN CONTENT */}

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
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        {/* HEADER */}

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
          }}
        >
          {/* TITLE */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minWidth: 0,
              flex: 1,
            }}
          >
            <IconButton
              onClick={() =>
                setMobileOpen((value) => !value)
              }
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

          {/* HEADER ACTIONS */}

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
            {/* Notifications */}

            <Tooltip title="Notifications">
              <IconButton
                onClick={(event) =>
                  setNotificationAnchor(
                    event.currentTarget
                  )
                }
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

            {/* Dark Mode */}

            <Tooltip
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              <IconButton
                onClick={() =>
                  setDarkMode((value) => !value)
                }
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

            {/* Profile */}

            <Tooltip title="Profile">
              <IconButton
                onClick={(event) =>
                  setProfileAnchor(
                    event.currentTarget
                  )
                }
                sx={{
                  ml: 0.5,
                  p: 0,
                }}
              >
                <Avatar
                  src={userPicture || undefined}
                  alt={userName}
                  imgProps={{
                    onError: (event) => {
                      event.currentTarget.style.display =
                        "none";
                    },
                  }}
                  sx={{
                    width: 38,
                    height: 38,
                    background:
                      "linear-gradient(135deg,#2563EB,#7C3AED)",
                    fontWeight: 700,
                  }}
                >
                  {!userPicture && userInitial}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* PAGE CONTENT */}

        <Box
          component="main"
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            flex: 1,
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

      {/* NOTIFICATIONS MENU */}

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() =>
          setNotificationAnchor(null)
        }
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
              onClick={() => {
                setNotifications((items) =>
                  items.map((item) => ({
                    ...item,
                    read: true,
                  }))
                );

                setNotificationAnchor(null);
              }}
              sx={{
                textTransform: "none",
              }}
            >
              Read all
            </Button>
          )}
        </Box>

        <Divider />

        {notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={() =>
              setNotifications((items) =>
                items.map((item) =>
                  item.id === notification.id
                    ? {
                        ...item,
                        read: true,
                      }
                    : item
                )
              )
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
            }}
          >
            <Typography
              sx={{
                fontWeight:
                  notification.read ? 500 : 700,
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
        ))}
      </Menu>

      {/* PROFILE MENU */}

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() =>
          setProfileAnchor(null)
        }
        PaperProps={{
          sx: {
            width: 260,
            mt: 1,
            borderRadius: 2,
            backgroundColor: colors.paper,
            color: colors.text,
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            src={userPicture || undefined}
            alt={userName}
            imgProps={{
              onError: (event) => {
                event.currentTarget.style.display =
                  "none";
              },
            }}
            sx={{
              background:
                "linear-gradient(135deg,#2563EB,#7C3AED)",
            }}
          >
            {!userPicture && userInitial}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: colors.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userName}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: colors.secondary,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userEmail || "AI Resume Analyzer"}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            setProfileDialogOpen(true);
          }}
        >
          <AccountCircleOutlinedIcon
            sx={{
              mr: 1.5,
              color: colors.secondary,
            }}
          />

          <Typography>
            Profile
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            setSettingsOpen(true);
          }}
        >
          <SettingsOutlinedIcon
            sx={{
              mr: 1.5,
              color: colors.secondary,
            }}
          />

          <Typography>
            Settings
          </Typography>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            setLogoutDialogOpen(true);
          }}
          sx={{
            color: "#DC2626",
          }}
        >
          <LogoutIcon
            sx={{
              mr: 1.5,
            }}
          />

          <Typography>
            Logout
          </Typography>
        </MenuItem>
      </Menu>

      {/* PROFILE DIALOG */}

      <Dialog
        open={profileDialogOpen}
        onClose={() =>
          setProfileDialogOpen(false)
        }
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
            justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          Candidate Profile

          <IconButton
            onClick={() =>
              setProfileDialogOpen(false)
            }
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
              src={userPicture || undefined}
              alt={userName}
              imgProps={{
                onError: (event) => {
                  event.currentTarget.style.display =
                    "none";
                },
              }}
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
              {!userPicture && userInitial}
            </Avatar>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: colors.text,
              }}
            >
              {userName}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: colors.secondary,
                mt: 0.5,
              }}
            >
              {userEmail || "No email available"}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: colors.secondary,
              }}
            >
              {currentUser?.role ||
                "Aspiring Machine Learning Engineer"}
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
            onClick={() =>
              setProfileDialogOpen(false)
            }
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* SETTINGS DIALOG */}

      <Dialog
        open={settingsOpen}
        onClose={() =>
          setSettingsOpen(false)
        }
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
            justifyContent: "space-between",
            fontWeight: 700,
          }}
        >
          Settings

          <IconButton
            onClick={() =>
              setSettingsOpen(false)
            }
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
                  onChange={() =>
                    setDarkMode(
                      (value) => !value
                    )
                  }
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
            Your appearance preference is
            saved automatically on this device.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            onClick={() =>
              setSettingsOpen(false)
            }
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* LOGOUT DIALOG */}

      <Dialog
        open={logoutDialogOpen}
        onClose={() =>
          setLogoutDialogOpen(false)
        }
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: colors.paper,
            color: colors.text,
          },
        }}
      >
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
            onClick={() =>
              setLogoutDialogOpen(false)
            }
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              color: "#FFFFFF",
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
              backgroundColor:
                "rgba(255,255,255,0.16)",
            }}
          >
            <LogoutIcon
              sx={{
                fontSize: 34,
              }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
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
            You&apos;re about to leave your AI
            Resume Analyzer session.
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
              You&apos;ll be redirected to the
              login page and can sign in again
              whenever you&apos;re ready.
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
            onClick={() =>
              setLogoutDialogOpen(false)
            }
            variant="outlined"
            fullWidth
            sx={{
              minHeight: 46,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              borderColor: colors.border,
              color: colors.text,
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
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}