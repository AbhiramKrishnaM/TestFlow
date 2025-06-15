import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from "@mui/material";
import { projectService, Project } from "../../services/project.service";
import { testCaseService, TestCase } from "../../services/testcase.service";
import { ProjectMembers } from "./ProjectMembers";
import { ProjectFlow } from "../../components/flow/ProjectFlow";
import { useProjects } from "../../layouts/DashboardLayout";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { AddTestCaseModal } from "../testcases/AddTestCaseModal";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `project-tab-${index}`,
    "aria-controls": `project-tabpanel-${index}`,
  };
};

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = parseInt(id || "0", 10);
  const { fetchProjects } = useProjects();
  const { showSnackbar } = useSnackbar();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isTestCaseModalOpen, setIsTestCaseModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        navigate("/projects");
        return;
      }

      try {
        setLoading(true);
        const projectData = await projectService.getProject(projectId);
        if (projectData) {
          setProject(projectData);
          setEditName(projectData.name);
          setEditDescription(projectData.description || "");
        } else {
          setError("Project not found");
          setTimeout(() => navigate("/projects"), 3000);
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditOpen = () => {
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSave = async () => {
    if (!project) return;

    try {
      const updatedProject = await projectService.updateProject(project.id, {
        name: editName,
        description: editDescription,
      });

      if (updatedProject) {
        setProject(updatedProject);
      }
      handleEditClose();
    } catch (err) {
      console.error("Error updating project:", err);
      setError("Failed to update project");
    }
  };

  const handleDelete = async () => {
    if (
      !project ||
      !window.confirm("Are you sure you want to delete this project?")
    )
      return;

    try {
      const success = await projectService.deleteProject(project.id);
      if (success) {
        showSnackbar("Project deleted successfully", "success");
        navigate("/projects", { state: { fromProjectDetail: true } });
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project");
      showSnackbar("Failed to delete project", "error");
    }
  };

  const fetchTestCases = async () => {
    try {
      const data = await testCaseService.getProjectTestCases(projectId);
      setTestCases(data);
    } catch (err) {
      console.error("Error fetching test cases:", err);
    }
  };

  useEffect(() => {
    if (project) {
      fetchTestCases();
    }
  }, [project]);

  const handleAddTestCase = async (
    title: string,
    description: string,
    status: string,
    priority: string
  ) => {
    try {
      const newTestCase = await testCaseService.createTestCase({
        title,
        description,
        project_id: projectId,
        status: status as any,
        priority: priority as any,
      });

      if (newTestCase) {
        setTestCases([...testCases, newTestCase]);
        showSnackbar("Test case created successfully", "success");
        setIsTestCaseModalOpen(false);
      }
    } catch (err) {
      console.error("Error creating test case:", err);
      showSnackbar("Failed to create test case", "error");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h5" color="error">
          {error || "Project not found"}
        </Typography>
        <Typography variant="body1" mt={2}>
          Redirecting to projects page...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="project tabs"
        >
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Members" {...a11yProps(1)} />
          <Tab label="Test Cases" {...a11yProps(2)} />
          <Tab label="Test Runs" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box>
          <ProjectFlow
            project={project}
            onEdit={handleEditOpen}
            onDelete={handleDelete}
          />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ProjectMembers projectId={project.id} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6">Test Cases</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
              onClick={() => setIsTestCaseModalOpen(true)}
            >
              Add Test Case
            </Button>
          </Box>
          {testCases.length === 0 ? (
            <Typography
              variant="body1"
              color="textSecondary"
              textAlign="center"
              py={4}
            >
              No test cases have been created for this project yet.
            </Typography>
          ) : (
            <Box>
              {/* Test case list will be implemented here */}
              <Typography variant="body2">
                {testCases.length} test case(s) found
              </Typography>
            </Box>
          )}
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Runs
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            textAlign="center"
            py={4}
          >
            No test runs have been executed for this project yet.
          </Typography>
          {/* Test runs will be implemented in the future */}
        </Paper>
      </TabPanel>

      {/* Edit Project Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button
            onClick={handleEditSave}
            color="primary"
            disabled={!editName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Test Case Modal */}
      <AddTestCaseModal
        isOpen={isTestCaseModalOpen}
        projectId={projectId}
        onClose={() => setIsTestCaseModalOpen(false)}
        onSubmit={handleAddTestCase}
      />
    </Box>
  );
};
