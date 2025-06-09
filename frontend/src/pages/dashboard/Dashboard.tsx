import React from "react";
import {
  Card,
  CardBody,
  Typography,
} from "../../components/MaterialTailwindFix";
import { useAuth } from "../../contexts/AuthContext";

export function Dashboard() {
  const { user } = useAuth();

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
          value="0"
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
