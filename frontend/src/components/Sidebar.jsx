import React from "react";

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import PsychologyIcon from "@mui/icons-material/Psychology";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";

import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    label: "Candidate",
    path: "/candidate",
    icon: <PersonIcon />,
  },
  {
    label: "Skills",
    path: "/skills",
    icon: <PsychologyIcon />,
  },
  {
    label: "Jobs",
    path: "/jobs",
    icon: <WorkIcon />,
  },
  {
    label: "Roadmap",
    path: "/roadmap",
    icon: <SchoolIcon />,
  },
  {
    label: "Report",
    path: "/report",
    icon: <PictureAsPdfIcon />,
  },
];

export default function Sidebar() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#061225",
        color: "#FFFFFF",
      }}
    >
      {/* BRAND */}

      <Box
        sx={{
          px: 3,
          py: 3,
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <DescriptionIcon
          sx={{
            fontSize: 42,
            color: "#60A5FA",
            mb: 1,
          }}
        />

        <Typography
          sx={{
            fontSize: "1.35rem",
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          AI Resume
        </Typography>

        <Typography
          sx={{
            fontSize: "0.9rem",
            color: "#CBD5E1",
            mt: 0.5,
          }}
        >
          Analyzer
        </Typography>
      </Box>

      {/* NAVIGATION */}

      <List
        disablePadding
        sx={{
          px: 1.5,
          py: 2,
          flex: 1,
        }}
      >
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
            }}
          >
            {({ isActive }) => (
              <ListItemButton
                sx={{
                  minHeight: 52,
                  mb: 0.7,
                  px: 2,
                  borderRadius: 2,

                  color: isActive
                    ? "#FFFFFF"
                    : "#CBD5E1",

                  backgroundColor: isActive
                    ? "#2563EB"
                    : "transparent",

                  "&:hover": {
                    backgroundColor: isActive
                      ? "#2563EB"
                      : "rgba(255,255,255,0.08)",

                    color: "#FFFFFF",
                  },

                  transition: "all 0.2s ease",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 42,
                    color: "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
              </ListItemButton>
            )}
          </NavLink>
        ))}
      </List>

      {/* FOOTER */}

      <Box
        sx={{
          px: 2,
          py: 2.5,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.78rem",
            color: "#94A3B8",
          }}
        >
          AI Resume Analyzer
        </Typography>

        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "#64748B",
            mt: 0.5,
          }}
        >
          Version 1.0
        </Typography>
      </Box>
    </Box>
  );
}