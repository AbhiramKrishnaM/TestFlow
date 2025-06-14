import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
} from "../components/MaterialTailwindFix";
import { NavLink } from "../components/ui/NavLink";
import { projectService, Project } from "../services/project.service";

// Create a context to share project data across components
interface ProjectContextType {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  loading: boolean;
  fetchProjects: () => Promise<void>;
}

export const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  setProjects: () => {},
  loading: true,
  fetchProjects: async () => {},
});

export const useProjects = () => useContext(ProjectContext);

// Title component that updates based on the current route
function PageTitle() {
  const location = useLocation();
  const path = location.pathname;

  let title = "Dashboard";
  if (path === "/projects") {
    title = "Projects";
  } else if (path.match(/^\/projects\/\d+$/)) {
    title = "Project Details";
  } else if (path === "/testcases") {
    title = "Test Cases";
  }

  return (
    <Typography variant="h4" className="font-bold text-gray-800 mb-6">
      {title}
    </Typography>
  );
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const projectsLoadedRef = useRef(false);

  // Fetch projects on component mount
  const fetchProjects = async () => {
    // Skip if already loaded or currently loading
    if (projectsLoadedRef.current) return;

    setLoading(true);
    try {
      projectsLoadedRef.current = true; // Mark as loading before the API call
      console.log("Fetching projects...");
      const data = await projectService.getProjects();
      console.log("Projects fetched:", data);
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      projectsLoadedRef.current = false; // Reset on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !projectsLoadedRef.current) {
      fetchProjects();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    projectsLoadedRef.current = false;
    navigate("/login");
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const hasProjects = projects.length > 0;

  return (
    <ProjectContext.Provider
      value={{ projects, setProjects, loading, fetchProjects }}
    >
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <Navbar className="max-w-full rounded-none px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hasProjects && (
                <IconButton
                  variant="text"
                  onClick={toggleDrawer}
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </IconButton>
              )}
              <Typography variant="h6" className="cursor-pointer py-1.5">
                TestFlow
              </Typography>
            </div>

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

        {/* Content */}
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar - Desktop */}
          {hasProjects && !loading && (
            <aside className="hidden w-64 bg-white p-4 shadow-md lg:block">
              <SidebarContent />
            </aside>
          )}

          {/* Sidebar - Mobile */}
          {hasProjects && !loading && (
            <Drawer
              open={drawerOpen}
              onClose={toggleDrawer}
              className="lg:hidden"
            >
              <div className="px-4 py-6">
                <Typography variant="h5" className="mb-6">
                  TestFlow
                </Typography>
                <SidebarContent onClick={toggleDrawer} />
              </div>
            </Drawer>
          )}

          {/* Main content */}
          <main className="flex-1 overflow-auto p-6">
            <PageTitle />
            <Outlet />
          </main>
        </div>
      </div>
    </ProjectContext.Provider>
  );
}

// Sidebar content component
function SidebarContent({ onClick }: { onClick?: () => void }) {
  return (
    <List>
      <NavLink
        to="/dashboard"
        onClick={onClick}
        exact={true}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/projects"
        onClick={onClick}
        exact={true}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        }
      >
        Projects
      </NavLink>

      <NavLink
        to="/testcases"
        onClick={onClick}
        exact={true}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        }
      >
        Test Cases
      </NavLink>
    </List>
  );
}
