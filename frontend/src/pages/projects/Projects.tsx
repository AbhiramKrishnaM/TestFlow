import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Card,
  CardBody,
  Button,
} from "../../components/MaterialTailwindFix";
import { projectService } from "../../services/project.service";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { CircularProgress } from "../../components/MUIComponents";
import { AddProjectModal } from "./AddProjectModal";
import { useProjects } from "../../layouts/DashboardLayout";

export function Projects() {
  const navigate = useNavigate();
  const { projects, setProjects, loading } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleAddProject = async (name: string, description: string) => {
    try {
      const newProject = await projectService.createProject({
        name,
        description,
      });

      if (newProject) {
        setProjects([...projects, newProject]);
        showSnackbar("Project created successfully", "success");
        setIsModalOpen(false);
      }
    } catch (error) {
      showSnackbar("Failed to create project", "error");
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const navigateToProject = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };

  // If loading, show a loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <CircularProgress size={40} />
      </div>
    );
  }

  // If no projects, show the empty state with centered button
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <div className="text-center">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-16 w-16 mx-auto text-blue-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <Typography variant="h4" className="mb-4 text-gray-800">
            No Projects Yet
          </Typography>
          <Typography className="mb-6 text-gray-600 max-w-md mx-auto">
            Create your first project to start organizing your test cases
          </Typography>
          <Button
            color="blue"
            className="flex items-center gap-2 px-6 py-3 text-lg shadow-md hover:shadow-lg transition-all mx-auto"
            onClick={openModal}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Project
          </Button>

          <AddProjectModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSubmit={handleAddProject}
          />
        </div>
      </div>
    );
  }

  // If there are projects, show the projects list
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Typography variant="h4">Projects</Typography>

        <Button
          color="blue"
          className="flex items-center gap-2"
          onClick={openModal}
        >
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
          Create Project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigateToProject(project.id)}
          >
            <CardBody>
              <Typography variant="h5">{project.name}</Typography>
              <Typography variant="small" color="gray" className="mb-4">
                {project.description || "No description"}
              </Typography>
              <div className="flex justify-end">
                <Button
                  variant="text"
                  size="sm"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    navigateToProject(project.id);
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleAddProject}
      />
    </div>
  );
}
