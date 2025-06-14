import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
} from "../../components/MaterialTailwindFix";
import { useAuth } from "../../contexts/AuthContext";
import { projectService, Project } from "../../services/project.service";
import { Link } from "react-router-dom";
import { AddProjectModal } from "../../pages/projects/AddProjectModal";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useProjects } from "../../layouts/DashboardLayout";

export function Dashboard() {
  const { user } = useAuth();
  const { projects, loading, setProjects } = useProjects();
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

  return (
    <div className="space-y-6">
      <Typography variant="h4">Dashboard</Typography>

      <Card>
        <CardBody>
          <Typography variant="h6" color="blue" className="mb-4">
            Welcome back, {user?.full_name || user?.username || "User"}!
          </Typography>
          <Typography>
            This is your TestFlow dashboard where you can manage your test cases
            and projects. Use the navigation menu to access different sections
            of the application.
          </Typography>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Projects"
          value={loading ? "..." : projects.length.toString()}
          description="Total projects"
          icon={
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
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          }
        />

        <StatCard
          title="Test Cases"
          value="0"
          description="Total test cases"
          icon={
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
        />

        <StatCard
          title="Passed Tests"
          value="0"
          description="Tests with passing status"
          icon={
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          }
        />
      </div>

      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-16 w-16"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
          </div>
          <Typography variant="h5" className="mb-2">
            No projects yet
          </Typography>
          <Typography className="mb-6 text-gray-600">
            Create your first project to start managing test cases
          </Typography>
          <Button color="blue" onClick={openModal}>
            + Add Project
          </Button>
        </div>
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleAddProject}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className="rounded-full bg-blue-50 p-3 text-blue-500">{icon}</div>
        <div>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="h4" color="blue">
            {value}
          </Typography>
          <Typography variant="small" color="gray">
            {description}
          </Typography>
        </div>
      </CardBody>
    </Card>
  );
}
