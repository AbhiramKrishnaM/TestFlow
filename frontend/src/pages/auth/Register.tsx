import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "../../components/MUIComponents";
import { LoadingButton } from "../../components/ui/LoadingButton";
import { useAuth } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/SnackbarContext";

export function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSnackbar } = useSnackbar();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setTimeout(() => {
        showSnackbar("Passwords do not match", "error");
      }, 100);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setTimeout(() => {
        showSnackbar("Password must be at least 8 characters long", "error");
      }, 100);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await register({
        email,
        username,
        password,
        full_name: fullName,
      });

      // Navigate to login page on successful registration
      // Delay navigation slightly to avoid transition issues
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { message: "Registration successful! Please log in." },
        });
      }, 100);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || "Registration failed. Please try again.";
      setError(errorMessage);

      // Only show snackbar if component is still mounted
      setTimeout(() => {
        showSnackbar(errorMessage, "error");
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Right side with registration form */}
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
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-semibold">
                  Sign in
                </Link>
              </Typography>
            </div>
          </div>

          <div className="mb-8">
            <Typography
              variant="h3"
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Sign up
            </Typography>
            <Typography variant="paragraph" className="text-gray-600">
              Create your TestFlow account to get started
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

          <form onSubmit={handleRegister}>
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="mb-4">
              <TextField
                type="email"
                label="Email address"
                variant="outlined"
                fullWidth
                placeholder="you@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                margin="normal"
              />
            </div>

            <div className="mb-4">
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                placeholder="johndoe"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUsername(e.target.value)
                }
                required
                margin="normal"
              />
            </div>

            <div className="mb-4">
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                placeholder="John Doe"
                value={fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFullName(e.target.value)
                }
                margin="normal"
              />
            </div>

            <div className="mb-4">
              <TextField
                type="password"
                label="Password"
                variant="outlined"
                fullWidth
                placeholder="Create a password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                margin="normal"
                helperText="Must be at least 8 characters"
              />
            </div>

            <div className="mb-6">
              <TextField
                type="password"
                label="Confirm Password"
                variant="outlined"
                fullWidth
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
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
              loadingText="Creating account..."
              className="py-3 rounded-lg"
              size="large"
            >
              Create account
            </LoadingButton>

            <p className="mt-4 text-sm text-center text-gray-500">
              By signing up, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Privacy Policy
              </a>
            </p>
          </form>
        </Paper>
      </div>
    </div>
  );
}
