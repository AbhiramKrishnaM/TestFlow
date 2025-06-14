import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, GuestRoute } from "./routes/AuthRoutes";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/mui-theme";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { StyledEngineProvider } from "@mui/material/styles";

// Layout components
import { DashboardLayout } from "./layouts/DashboardLayout";

// Auth pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

// Dashboard pages
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Projects } from "./pages/projects/Projects";
import { ProjectDetail } from "./pages/projects/ProjectDetail";
import { TestCases } from "./pages/testcases/TestCases";

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <AuthProvider>
            <Routes>
              {/* Auth Routes */}
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/testcases" element={<TestCases />} />
                </Route>
              </Route>

              {/* Redirect to login */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
