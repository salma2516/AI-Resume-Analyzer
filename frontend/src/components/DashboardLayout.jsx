import { useEffect, useMemo, useState } from "react";
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
  TextField,
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

/* =========================================================
   USER
========================================================= */

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
  if (!user || typeof user !== "object") return "";

  return String(
    user.name ||
      user.displayName ||
      user.full_name ||
      user.fullName ||
      user.given_name ||
      user.first_name ||
      ""
  ).trim();
}

function getUserEmail(user) {
  if (!user || typeof user !== "object") return "";

  return String(
    user.email || user.emailAddress || ""
  ).trim();
}

function getUserPicture(user) {
  if (!user || typeof user !== "object") return "";

  return (
    user.profile_picture ||
    user.profilePicture ||
    user.picture ||
    user.image ||
    ""
  );
}

/* =========================================================
   EACH USER GETS THEIR OWN PROFILE
========================================================= */

function getProfileKey(email) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  return `aiResumeProfile_${encodeURIComponent(
    normalizedEmail || "unknown"
  )}`;
}

function readProfile(email) {
  try {
    const raw = localStorage.getItem(
      getProfileKey(email)
    );

    if (!raw) {
      return {
        name: "",
        role: "",
        careerGoal: "",
      };
    }

    const data = JSON.parse(raw);

    return {
      name:
        typeof data?.name === "string"
          ? data.name
          : "",

      role:
        typeof data?.role === "string"
          ? data.role
          : "",

      careerGoal:
        typeof data?.careerGoal === "string"
          ? data.careerGoal
          : "",
    };
  } catch (error) {
    console.error("Unable to read profile:", error);

    return {
      name: "",
      role: "",
      careerGoal: "",
    };
  }
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() =>
    readStoredUser()
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return (
        localStorage.getItem("aiResumeTheme") === "dark"
      );
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

  /* =========================================================
     USER INFORMATION
  ========================================================= */

  const userEmail = useMemo(
    () => getUserEmail(currentUser),
    [currentUser]
  );

  const userPicture = useMemo(
    () => getUserPicture(currentUser),
    [currentUser]
  );

  const [profile, setProfile] = useState(() =>
    readProfile(
      getUserEmail(readStoredUser())
    )
  );

  const [profileForm, setProfileForm] = useState({
    name: "",
    role: "",
    careerGoal: "",
  });

  const [profileError, setProfileError] =
    useState("");

  /*
   * IMPORTANT:
   * There is NO hard-coded role.
   * There is NO hard-coded career goal.
   */

  const userName =
    profile.name.trim() ||
    getUserName(currentUser) ||
    "User";

  const userInitial =
    userName.charAt(0).toUpperCase() || "U";

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  /* =========================================================
     COLORS
  ========================================================= */

  const colors = {
    background: darkMode
      ? "#0F172A"
      : "#F5F7FB",

    header: darkMode
      ? "#111827"
      : "#FFFFFF",

    text: darkMode
      ? "#F8FAFC"
      : "#0F172A",

    secondary: darkMode
      ? "#CBD5E1"
      : "#64748B",

    border: darkMode
      ? "#334155"
      : "#E2E8F0",

    paper: darkMode
      ? "#1E293B"
      : "#FFFFFF",
  };

  /* =========================================================
     SYNC LOGGED-IN USER
  ========================================================= */

  useEffect(() => {
    const syncUser = () => {
      const nextUser = readStoredUser();

      setCurrentUser(nextUser);

      const email = getUserEmail(nextUser);

      setProfile(readProfile(email));
    };

    syncUser();

    window.addEventListener(
      "storage",
      syncUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncUser
      );
    };
  }, []);

  /* =========================================================
     OPEN PROFILE FORM
  ========================================================= */

  useEffect(() => {
    if (!profileDialogOpen) return;

    setProfileForm({
      name: profile.name || "",
      role: profile.role || "",
      careerGoal: profile.careerGoal || "",
    });

    setProfileError("");
  }, [profileDialogOpen, profile]);

  /* =========================================================
     NEW USER PROFILE
  ========================================================= */

  useEffect(() => {
    if (!userEmail) return;

    const savedProfile = readProfile(userEmail);

    /*
     * If this user has not completed their profile,
     * ask them to enter it.
     */

    if (
      !savedProfile.name ||
      !savedProfile.role ||
      !savedProfile.careerGoal
    ) {
      setProfileForm({
        name: savedProfile.name || "",
        role: savedProfile.role || "",
        careerGoal:
          savedProfile.careerGoal || "",
      });

      setProfileDialogOpen(true);
    }
  }, [userEmail]);

  /* =========================================================
     DARK MODE
  ========================================================= */

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

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSaveProfile = () => {
    const name =
      profileForm.name.trim();

    const role =
      profileForm.role.trim();

    const careerGoal =
      profileForm.careerGoal.trim();

    if (!name || !role || !careerGoal) {
      setProfileError(
        "Please fill in your name, target role, and career goal."
      );

      return;
    }

    const updatedProfile = {
      name,
      role,
      careerGoal,
    };

    try {
      /*
       * Save using the current user's email.
       * Therefore every Google account has separate data.
       */

      const key =
        getProfileKey(userEmail);

      localStorage.setItem(
        key,
        JSON.stringify(updatedProfile)
      );

      setProfile(updatedProfile);

      /*
       * Also update the stored user name.
       */

      const storedUser =
        readStoredUser();

      if (
        storedUser &&
        typeof storedUser === "object"
      ) {
        const updatedUser = {
          ...storedUser,
          name,
        };

        localStorage.setItem(
          "aiResumeUser",
          JSON.stringify(updatedUser)
        );

        setCurrentUser(updatedUser);
      }

      setProfileError("");

      setProfileDialogOpen(false);
    } catch (error) {
      console.error(
        "Unable to save profile:",
        error
      );

      setProfileError(
        "Unable to save your profile."
      );
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

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
      // Continue logout.
    }

    try {
      googleLogout();
    } catch {
      // Continue logout.
    }

    setCurrentUser(null);

    setProfile({
      name: "",
      role: "",
      careerGoal: "",
    });

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

  /* =========================================================
     UI
  ========================================================= */

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
        onClose={() =>
          setMobileOpen(false)
        }
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

            backgroundColor:
              colors.header,

            borderBottom:
              `1px solid ${colors.border}`,

            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",

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
                setMobileOpen(
                  (v) => !v
                )
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
            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) =>
                  setNotificationAnchor(
                    e.currentTarget
                  )
                }
                sx={{
                  color: colors.text,
                }}
              >
                <Badge
                  badgeContent={
                    unreadCount
                  }
                  color="error"
                  max={99}
                >
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              <IconButton
                onClick={() =>
                  setDarkMode(
                    (v) => !v
                  )
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

            <Tooltip title="Profile">
              <IconButton
                onClick={(e) =>
                  setProfileAnchor(
                    e.currentTarget
                  )
                }
                sx={{
                  ml: 0.5,
                  p: 0,
                }}
              >
                <Avatar
                  src={
                    userPicture ||
                    undefined
                  }
                  alt={userName}
                  sx={{
                    width: 38,
                    height: 38,

                    background:
                      "linear-gradient(135deg,#2563EB,#7C3AED)",

                    fontWeight: 700,
                  }}
                >
                  {!userPicture &&
                    userInitial}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* MAIN */}

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

      {/* =====================================================
          NOTIFICATIONS
      ===================================================== */}

      <Menu
        anchorEl={
          notificationAnchor
        }
        open={Boolean(
          notificationAnchor
        )}
        onClose={() =>
          setNotificationAnchor(null)
        }
        PaperProps={{
          sx: {
            width: {
              xs: 320,
              sm: 390,
            },

            maxWidth:
              "calc(100vw - 24px)",

            mt: 1,

            borderRadius: 2,

            backgroundColor:
              colors.paper,

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

            justifyContent:
              "space-between",
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
              startIcon={
                <DoneAllIcon />
              }
              onClick={() => {
                setNotifications(
                  (items) =>
                    items.map(
                      (item) => ({
                        ...item,
                        read: true,
                      })
                    )
                );

                setNotificationAnchor(
                  null
                );
              }}
              sx={{
                textTransform:
                  "none",
              }}
            >
              Read all
            </Button>
          )}
        </Box>

        <Divider />

        {notifications.map(
          (notification) => (
            <MenuItem
              key={
                notification.id
              }
              onClick={() =>
                setNotifications(
                  (items) =>
                    items.map(
                      (item) =>
                        item.id ===
                        notification.id
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
                whiteSpace:
                  "normal",

                py: 1.5,
                px: 2,

                borderLeft:
                  notification.read
                    ? "3px solid transparent"
                    : "3px solid #2563EB",

                backgroundColor:
                  notification.read
                    ? "transparent"
                    : darkMode
                      ? "#172554"
                      : "#EFF6FF",
              }}
            >
              <Typography
                sx={{
                  fontWeight:
                    notification.read
                      ? 500
                      : 700,

                  color:
                    colors.text,

                  mb: 0.4,
                }}
              >
                {notification.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color:
                    colors.secondary,

                  lineHeight: 1.4,
                }}
              >
                {
                  notification.message
                }
              </Typography>
            </MenuItem>
          )
        )}
      </Menu>

      {/* =====================================================
          PROFILE MENU
      ===================================================== */}

      <Menu
        anchorEl={
          profileAnchor
        }
        open={Boolean(
          profileAnchor
        )}
        onClose={() =>
          setProfileAnchor(null)
        }
        PaperProps={{
          sx: {
            width: 280,
            mt: 1,
            borderRadius: 2,
            backgroundColor:
              colors.paper,
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
            src={
              userPicture ||
              undefined
            }
            alt={userName}
            sx={{
              background:
                "linear-gradient(135deg,#2563EB,#7C3AED)",
            }}
          >
            {!userPicture &&
              userInitial}
          </Avatar>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: colors.text,

                overflow: "hidden",
                textOverflow:
                  "ellipsis",
              }}
            >
              {userName}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color:
                  colors.secondary,

                overflow: "hidden",
                textOverflow:
                  "ellipsis",
              }}
            >
              {userEmail ||
                "No email available"}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            setProfileDialogOpen(
              true
            );
          }}
        >
          <AccountCircleOutlinedIcon
            sx={{
              mr: 1.5,
              color:
                colors.secondary,
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
              color:
                colors.secondary,
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
            setLogoutDialogOpen(
              true
            );
          }}
          sx={{
            color: "#DC2626",
          }}
        >
          <LogoutIcon
            sx={{ mr: 1.5 }}
          />

          <Typography>
            Logout
          </Typography>
        </MenuItem>
      </Menu>

      {/* =====================================================
          PROFILE DIALOG
      ===================================================== */}

      <Dialog
        open={profileDialogOpen}
        onClose={() => {
          /*
           * A new user must complete the profile.
           */
          if (
            profile.name &&
            profile.role &&
            profile.careerGoal
          ) {
            setProfileDialogOpen(
              false
            );
          }
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor:
              colors.paper,
            color: colors.text,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            fontWeight: 700,
          }}
        >
          {profile.name &&
          profile.role &&
          profile.careerGoal
            ? "Edit Your Profile"
            : "Complete Your Profile"}

          {profile.name &&
            profile.role &&
            profile.careerGoal && (
              <IconButton
                onClick={() =>
                  setProfileDialogOpen(
                    false
                  )
                }
                sx={{
                  color:
                    colors.text,
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
        </DialogTitle>

        <DialogContent dividers>
          <Box
            sx={{
              display: "flex",
              flexDirection:
                "column",
              alignItems:
                "center",
              textAlign:
                "center",

              py: 1,
            }}
          >
            <Avatar
              src={
                userPicture ||
                undefined
              }
              alt={userName}
              sx={{
                width: 80,
                height: 80,

                mb: 2,

                fontSize:
                  "2rem",

                fontWeight: 700,

                background:
                  "linear-gradient(135deg,#2563EB,#7C3AED)",
              }}
            >
              {!userPicture &&
                userInitial}
            </Avatar>

            <Typography
              variant="body2"
              sx={{
                color:
                  colors.secondary,
                mb: 2,
              }}
            >
              Enter your own
              professional
              information.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
            }}
          >
            {/* USER ENTERS NAME */}

            <TextField
              label="Full Name"
              value={
                profileForm.name
              }
              onChange={(e) =>
                setProfileForm(
                  (prev) => ({
                    ...prev,
                    name:
                      e.target.value,
                  })
                )
              }
              fullWidth
              required
            />

            {/* GOOGLE EMAIL */}

            <TextField
              label="Email"
              value={
                userEmail
              }
              fullWidth
              disabled
              helperText="Email is taken from your Google account."
            />

            {/* USER ENTERS ROLE */}

            <TextField
              label="Current / Target Role"
              placeholder="Example: Machine Learning Engineer"
              value={
                profileForm.role
              }
              onChange={(e) =>
                setProfileForm(
                  (prev) => ({
                    ...prev,
                    role:
                      e.target.value,
                  })
                )
              }
              fullWidth
              required
            />

            {/* USER ENTERS CAREER GOAL */}

            <TextField
              label="Career Goal"
              placeholder="Example: Become an AI Engineer specializing in Generative AI"
              value={
                profileForm.careerGoal
              }
              onChange={(e) =>
                setProfileForm(
                  (prev) => ({
                    ...prev,
                    careerGoal:
                      e.target.value,
                  })
                )
              }
              fullWidth
              required
              multiline
              minRows={3}
            />
          </Box>

          {profileError && (
            <Typography
              sx={{
                mt: 2,
                color: "#DC2626",
                fontWeight: 600,
              }}
            >
              {profileError}
            </Typography>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mt: 2.5,
              borderRadius: 2,

              backgroundColor:
                darkMode
                  ? "#0F172A"
                  : "#F8FAFC",

              border:
                `1px solid ${colors.border}`,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                mb: 0.7,
                color:
                  colors.text,
              }}
            >
              Your Profile
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color:
                  colors.secondary,
                lineHeight: 1.6,
              }}
            >
              Your name, target
              role and career
              goal are entered
              by you and saved
              separately for
              your account.
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            gap: 1,
          }}
        >
          {profile.name &&
            profile.role &&
            profile.careerGoal && (
              <Button
                onClick={() =>
                  setProfileDialogOpen(
                    false
                  )
                }
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  textTransform:
                    "none",
                  fontWeight: 700,
                }}
              >
                Cancel
              </Button>
            )}

          <Button
            onClick={
              handleSaveProfile
            }
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform:
                "none",
              fontWeight: 700,
              minWidth: 130,
            }}
          >
            Save Profile
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          SETTINGS
      ===================================================== */}

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
            backgroundColor:
              colors.paper,
            color: colors.text,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            fontWeight: 700,
          }}
        >
          Settings

          <IconButton
            onClick={() =>
              setSettingsOpen(false)
            }
            sx={{
              color:
                colors.text,
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
              color:
                colors.text,
            }}
          >
            Appearance
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,

              backgroundColor:
                darkMode
                  ? "#0F172A"
                  : "#F8FAFC",

              border:
                `1px solid ${colors.border}`,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={() =>
                    setDarkMode(
                      (v) => !v
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
                color:
                  colors.text,
              }}
            />
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
              setSettingsOpen(false)
            }
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform:
                "none",
              fontWeight: 700,
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          LOGOUT
      ===================================================== */}

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
            backgroundColor:
              colors.paper,
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

            textAlign:
              "center",

            background:
              "linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)",

            color: "#FFFFFF",
          }}
        >
          <IconButton
            onClick={() =>
              setLogoutDialogOpen(
                false
              )
            }
            sx={{
              position:
                "absolute",
              top: 10,
              right: 10,
              color:
                "#FFFFFF",
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

              borderRadius:
                "50%",

              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",

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
              fontSize:
                "0.95rem",
            }}
          >
            You&apos;re about
            to leave your AI
            Resume Analyzer
            session.
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

              backgroundColor:
                darkMode
                  ? "#0F172A"
                  : "#F8FAFC",

              border:
                `1px solid ${colors.border}`,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color:
                  colors.text,
                mb: 0.6,
              }}
            >
              Your session will
              be closed
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color:
                  colors.secondary,
                lineHeight: 1.6,
              }}
            >
              You&apos;ll be
              redirected to the
              login page and
              can sign in again
              whenever you&apos;re
              ready.
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
              setLogoutDialogOpen(
                false
              )
            }
            variant="outlined"
            fullWidth
            sx={{
              minHeight: 46,
              borderRadius: 2.5,
              textTransform:
                "none",
              fontWeight: 700,
              borderColor:
                colors.border,
              color:
                colors.text,
            }}
          >
            Stay Signed In
          </Button>

          <Button
            onClick={
              handleLogoutConfirm
            }
            variant="contained"
            startIcon={
              <LogoutIcon />
            }
            fullWidth
            sx={{
              minHeight: 46,
              borderRadius: 2.5,
              textTransform:
                "none",
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