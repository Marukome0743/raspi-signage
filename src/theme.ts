"use client"
import { createTheme, type Theme } from "@mui/material"

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none" as const,
        fontWeight: 600,
        borderRadius: 8,
        padding: "8px 20px",
      },
      contained: {
        boxShadow: "none",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
        borderRadius: 12,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: "outlined" as const,
      size: "small" as const,
    },
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 8,
        },
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: "2px 8px",
        "&.Mui-selected": {
          backgroundColor: "rgba(22, 163, 74, 0.10)",
          "&:hover": {
            backgroundColor: "rgba(22, 163, 74, 0.16)",
          },
        },
        "&:hover": {
          backgroundColor: "rgba(22, 163, 74, 0.06)",
        },
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: 40,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: {
        textTransform: "none" as const,
        "&.Mui-selected": {
          backgroundColor: "rgba(22, 163, 74, 0.10)",
          color: "#16A34A",
          borderColor: "#16A34A",
          "&:hover": {
            backgroundColor: "rgba(22, 163, 74, 0.16)",
          },
        },
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: {
        "&.Mui-checked": {
          color: "#16A34A",
        },
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        backgroundColor: "#16A34A",
      },
    },
  },
}

export function createAppTheme(mode: "light" | "dark"): Theme {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#16A34A",
        light: "#22C55E",
        dark: "#15803D",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: mode === "light" ? "#64748B" : "#94A3B8",
        light: "#94A3B8",
        dark: "#475569",
        contrastText: "#FFFFFF",
      },
      background: {
        default: mode === "light" ? "#F1F5F9" : "#0F172A",
        paper: mode === "light" ? "#FFFFFF" : "#1E293B",
      },
      text: {
        primary: mode === "light" ? "#0F172A" : "#F8FAFC",
        secondary: mode === "light" ? "#64748B" : "#94A3B8",
      },
      error: {
        main: mode === "light" ? "#DC2626" : "#EF4444",
      },
      divider: mode === "light" ? "#E2E8F0" : "#334155",
      action: {
        hover: "rgba(22, 163, 74, 0.06)",
        selected: "rgba(22, 163, 74, 0.10)",
      },
    },
    typography: {
      fontFamily: "var(--font-roboto)",
      h5: { fontWeight: 600, letterSpacing: "0.01em" },
      h6: { fontWeight: 600, letterSpacing: "0.01em" },
      subtitle1: { fontWeight: 500 },
    },
    shape: { borderRadius: 10 },
    components: {
      ...sharedComponents,
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: 12,
            border: `1px solid ${mode === "light" ? "#E2E8F0" : "#334155"}`,
          },
        },
      },
      MuiButton: {
        ...sharedComponents.MuiButton,
        styleOverrides: {
          ...sharedComponents.MuiButton.styleOverrides,
          outlined: {
            borderColor: mode === "light" ? "#CBD5E1" : "#475569",
            "&:hover": {
              borderColor: "#16A34A",
              backgroundColor: "rgba(22, 163, 74, 0.06)",
            },
          },
        },
      },
      MuiTextField: {
        ...sharedComponents.MuiTextField,
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              "& fieldset": {
                borderColor: mode === "light" ? "#CBD5E1" : "#475569",
              },
              "&:hover fieldset": {
                borderColor: "#16A34A",
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: mode === "light" ? "#FFFFFF" : "#1E293B",
            borderBottom: `1px solid ${mode === "light" ? "#E2E8F0" : "#334155"}`,
            color: mode === "light" ? "#0F172A" : "#F8FAFC",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === "light" ? "#FFFFFF" : "#0F172A",
            borderRight: `1px solid ${mode === "light" ? "#E2E8F0" : "#334155"}`,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: mode === "light" ? "#64748B" : "#94A3B8",
            minWidth: 40,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === "light" ? "#E2E8F0" : "#334155",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: `1px solid ${mode === "light" ? "#E2E8F0" : "#334155"}`,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none" as const,
            borderColor: mode === "light" ? "#CBD5E1" : "#475569",
            color: mode === "light" ? "#64748B" : "#94A3B8",
            "&.Mui-selected": {
              backgroundColor: "rgba(22, 163, 74, 0.10)",
              color: "#16A34A",
              borderColor: "#16A34A",
              "&:hover": {
                backgroundColor: "rgba(22, 163, 74, 0.16)",
              },
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: mode === "light" ? "#CBD5E1" : "#475569",
            "&.Mui-checked": {
              color: "#16A34A",
            },
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor:
              mode === "light"
                ? "rgba(15, 23, 42, 0.5)"
                : "rgba(15, 23, 42, 0.8)",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: mode === "light" ? "#64748B" : "#94A3B8",
            "&:hover": {
              backgroundColor: "rgba(22, 163, 74, 0.06)",
            },
          },
        },
      },
    },
  })
}

const theme = createAppTheme("light")
export default theme
