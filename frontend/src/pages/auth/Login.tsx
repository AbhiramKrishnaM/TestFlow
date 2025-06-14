import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardBody,
  Typography,
} from "../../components/MaterialTailwindFix";
import { authService } from "../../services/auth.service";
import {
  TextField,
  Alert,
  Box,
  Divider,
  Paper,
  CircularProgress,
  Button,
} from "../../components/MUIComponents";
import { LoadingButton } from "../../components/ui/LoadingButton";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";

interface LocationState {
  message?: string;
}

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();
  const location = useLocation();

  // Get the intended destination from location state, or default to dashboard
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  // Check for messages from other pages (like successful registration)
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.message) {
      // Delay showing the snackbar to ensure DOM is ready
      setTimeout(() => {
        showSnackbar(state.message as string, "success");
      }, 300);

      // Clear the message from location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, showSnackbar]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter both email and password");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await login(username, password);

      // Delay navigation slightly to avoid transition issues
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );

      // Only show snackbar if component is still mounted
      setTimeout(() => {
        showSnackbar("Login failed. Please check your credentials.", "error");
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Right side with login form */}
      <div className="w-full flex items-center justify-center p-8">
        <Paper elevation={3} className="w-full max-w-md p-6 rounded-xl">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded bg-blue-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold">TestFlow</span>
            </div>
            <div>
              <Typography variant="small" className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 font-semibold">
                  Sign up
                </Link>
              </Typography>
            </div>
          </div>

          <div className="mb-8">
            <Typography
              variant="h3"
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Sign in
            </Typography>
            <Typography variant="paragraph" className="text-gray-600">
              Sign in with your TestFlow account to continue
            </Typography>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            <button className="flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              <span>Google</span>
            </button>
          </div>

          <Box className="flex items-center gap-3 mb-6">
            <Divider className="h-px bg-gray-300 flex-grow" />
            <Typography variant="small" className="text-gray-500">
              Or continue with email
            </Typography>
            <Divider className="h-px bg-gray-300 flex-grow" />
          </Box>

          <form onSubmit={handleLogin}>
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="mb-4">
              <TextField
                label="Email address"
                variant="outlined"
                fullWidth
                placeholder="you@example.com"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUsername(e.target.value)
                }
                required
                margin="normal"
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </a>
              </div>
              <TextField
                type="password"
                label="Password"
                variant="outlined"
                fullWidth
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                margin="normal"
              />
            </div>

            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              loading={isLoading}
              loadingText="Signing in..."
              className="py-3 rounded-lg"
              size="large"
            >
              Login
            </LoadingButton>
          </form>
        </Paper>
      </div>
    </div>
  );
}
