import React from "react";
import {
  Typography,
  Card,
  CardBody,
  Button,
} from "../../components/MaterialTailwindFix";

export function Projects() {
  // This would typically fetch projects from an API
  const projects: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Typography variant="h4">Projects</Typography>

        <Button color="blue" className="flex items-center gap-2">
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

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardBody>
                <Typography variant="h5">{project.name}</Typography>
                <Typography variant="small" color="gray" className="mb-4">
                  {project.description || "No description"}
                </Typography>
                <div className="flex justify-end">
                  <Button variant="text" size="sm">
                    View Details
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-blue-50 p-4 text-blue-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-10 w-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <Typography variant="h6" className="mb-2">
              No Projects Found
            </Typography>
            <Typography className="text-center mb-6" color="gray">
              You haven't created any projects yet. Get started by creating your
              first project.
            </Typography>
            <Button color="blue" className="flex items-center gap-2">
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
              Create Your First Project
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
