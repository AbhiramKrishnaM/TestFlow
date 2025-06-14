import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress } from "../components/MUIComponents";

// Route for authenticated users only
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <CircularProgress size={40} />
      </div>
    );
  }

  // Redirect to login if not authenticated
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

// Route for guests only (not authenticated)
export const GuestRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, or default to dashboard
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  // Effect to handle redirection when authentication state changes
  useEffect(() => {
    // Only redirect after the initial loading is complete and user is authenticated
    if (isAuthenticated && !isLoading) {
      // Use setTimeout to avoid transition issues
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <CircularProgress size={40} />
      </div>
    );
  }

  // Show the outlet (login/register) if not authenticated
  return isAuthenticated ? null : <Outlet />;
};
