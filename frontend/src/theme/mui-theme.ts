import { createTheme } from "@mui/material/styles";

// Create a custom theme for TestFlow
const theme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6", // Blue-500 from Tailwind
      light: "#60a5fa", // Blue-400
      dark: "#2563eb", // Blue-600
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#6b7280", // Gray-500 from Tailwind
      light: "#9ca3af", // Gray-400
      dark: "#4b5563", // Gray-600
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444", // Red-500
      light: "#f87171", // Red-400
      dark: "#dc2626", // Red-600
    },
    warning: {
      main: "#f59e0b", // Amber-500
      light: "#fbbf24", // Amber-400
      dark: "#d97706", // Amber-600
    },
    info: {
      main: "#3b82f6", // Blue-500
      light: "#60a5fa", // Blue-400
      dark: "#2563eb", // Blue-600
    },
    success: {
      main: "#10b981", // Emerald-500
      light: "#34d399", // Emerald-400
      dark: "#059669", // Emerald-600
    },
    background: {
      default: "#f9fafb", // Gray-50
      paper: "#ffffff",
    },
    text: {
      primary: "#111827", // Gray-900
      secondary: "#4b5563", // Gray-600
      disabled: "#9ca3af", // Gray-400
    },
  },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#2563eb", // Blue-600
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: "#3b82f6", // Blue-500
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
        elevation1: {
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
        elevation2: {
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
        elevation3: {
          boxShadow:
            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        },
      },
    },
  },
});

export default theme;
