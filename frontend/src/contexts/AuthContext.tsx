import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { authService } from "../services/auth.service";
import { projectService } from "../services/project.service";
import { useNavigate } from "react-router-dom";

// User type from the service
interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
}

// Auth context state
interface AuthContextState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

// Register data interface
interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

// Create context with default values
const AuthContext = createContext<AuthContextState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {
    throw new Error("Not implemented");
  },
  logout: () => {},
  register: async () => {},
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authCheckRef = useRef(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    // Prevent duplicate API calls
    if (authCheckRef.current) return;

    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          authCheckRef.current = true;
          const user = await authService.fetchUserProfile();
          setUser(user);
        } catch (error) {
          // Token might be invalid or expired
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.login(username, password);
      setUser(user);
      authCheckRef.current = true;
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    authCheckRef.current = false;

    // Clear project cache on logout
    projectService.clearCache();
  }, []);

  // Register function
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await authService.register(data);
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
