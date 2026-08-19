import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#7c3aed",
    },
    success: {
      main: "#10b981",
    },
    background: {
      default: "#f5f7fb",
    },
  },

  shape: {
    borderRadius: 16,
  },

  typography: {
    fontFamily: "Poppins, Roboto, sans-serif",

    h3: {
      fontWeight: 700,
    },

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 600,
    },
  },
});

export default theme;