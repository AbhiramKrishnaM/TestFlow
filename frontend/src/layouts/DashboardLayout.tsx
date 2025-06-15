import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
} from "../components/MaterialTailwindFix";
import { projectService, Project } from "../services/project.service";

// Create a context to share project data across components
interface ProjectContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  loading: boolean;
  fetchProjects: (force?: boolean) => Promise<void>;
}

export const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  setProjects: () => {},
  loading: true,
  fetchProjects: async (force?: boolean) => {},
});

export const useProjects = () => useContext(ProjectContext);

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const projectsLoadedRef = useRef(false);

  // Fetch projects on component mount
  const fetchProjects = async (force = false) => {
    try {
      setLoading(true);
      console.log("Fetching projects...");
      if (force) {
        // Clear the cache to force a fresh fetch
        projectService.clearCache();
      }
      const data = await projectService.getProjects();
      console.log("Projects fetched:", data);
      setProjects(data);
      projectsLoadedRef.current = true;
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of projects
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // More selective refresh strategy for smoother navigation
  useEffect(() => {
    // Only refresh projects in specific cases:
    // 1. When navigating to the projects page and we don't have projects loaded yet
    // 2. When navigating to the projects page from a state that indicates we need a refresh
    const needsRefresh = location.state && location.state.fromProjectDetail;

    if (
      (location.pathname === "/projects" && !projectsLoadedRef.current) ||
      needsRefresh
    ) {
      // Clear location state after using it
      if (needsRefresh) {
        window.history.replaceState({}, document.title);
      }
      fetchProjects();
    }
  }, [location.pathname, location.state]);

  const handleLogout = () => {
    logout();
    projectsLoadedRef.current = false;
    navigate("/login");
  };

  // Check if current path matches the link path
  const isActive = (path: string) => {
    if (path === "/projects" && location.pathname.match(/^\/projects\/\d+/)) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <ProjectContext.Provider
      value={{ projects, setProjects, loading, fetchProjects }}
    >
      <div className="min-h-screen bg-gray-100">
        {/* Top Navigation Bar */}
        <Navbar className="max-w-full rounded-none px-6 py-3 bg-white shadow-sm">
          <div className="flex items-center justify-between w-full">
            {/* Logo and App Name */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <Typography
                  variant="h5"
                  className="font-medium text-blue-600 logo-text"
                >
                  Test Flow
                </Typography>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="flex space-x-12">
                <NavItem to="/dashboard" active={isActive("/dashboard")}>
                  Dashboard
                </NavItem>
                <NavItem to="/projects" active={isActive("/projects")}>
                  Report
                </NavItem>
                <NavItem to="#" active={false}>
                  Fee Management
                </NavItem>
                <NavItem to="#" active={false}>
                  Integrations
                </NavItem>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:block">
                <Typography variant="small" color="blue-gray">
                  {user?.full_name || user?.username}
                </Typography>
              </div>
              <Button
                variant="text"
                size="sm"
                onClick={handleLogout}
                className="hidden lg:inline-block"
              >
                Logout
              </Button>

              {/* Mobile menu button */}
              <IconButton
                variant="text"
                onClick={handleLogout}
                className="lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </IconButton>
            </div>
          </div>
        </Navbar>

        {/* Main content */}
        <main className="w-full overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </ProjectContext.Provider>
  );
}

// Navigation Item Component
interface NavItemProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ to, active, children }) => {
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium transition-colors relative ${
        active ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>
      )}
    </Link>
  );
};
