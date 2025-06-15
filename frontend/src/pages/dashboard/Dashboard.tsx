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
import { Grid, Box, Paper } from "@mui/material";
import {
  BarChart,
  PieChart,
  LineChart,
  AreaPlot,
  ResponsiveChartContainer,
} from "@mui/x-charts";
import {
  analyticsService,
  TestStatusCount,
  TestPriorityCount,
  ProjectActivityData,
  TestProgressData,
} from "../../services/analytics.service";

export function Dashboard() {
  const { user } = useAuth();
  const { projects, loading, setProjects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  // Analytics states
  const [testStatusData, setTestStatusData] = useState<TestStatusCount>({
    tested: 0,
    untested: 0,
    total: 0,
  });
  const [testPriorityData, setTestPriorityData] = useState<TestPriorityCount>({
    high: 0,
    normal: 0,
    low: 0,
    total: 0,
  });
  const [projectActivity, setProjectActivity] = useState<ProjectActivityData>({
    dates: [],
    test_counts: [],
    feature_counts: [],
  });
  const [testProgress, setTestProgress] = useState<TestProgressData>({
    months: [],
    completed: [],
    added: [],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setAnalyticsLoading(true);
      try {
        const [statusData, priorityData, activityData, progressData] =
          await Promise.all([
            analyticsService.getTestStatusCounts(),
            analyticsService.getTestPriorityCounts(),
            analyticsService.getProjectActivity(),
            analyticsService.getTestProgress(),
          ]);

        setTestStatusData(statusData);
        setTestPriorityData(priorityData);
        setProjectActivity(activityData);
        setTestProgress(progressData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

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

  // Prepare chart data
  const testStatusSeries = [
    {
      data: [testStatusData.tested, testStatusData.untested],
      label: "Test Status",
      type: "pie",
    },
  ];

  const testStatusLabels = ["Tested", "Untested"];

  const testPrioritySeries = [
    {
      data: [
        testPriorityData.high,
        testPriorityData.normal,
        testPriorityData.low,
      ],
      label: "Priority",
    },
  ];

  return (
    <div className="space-y-6">
      <Typography variant="h4" className="mb-6">
        Dashboard
      </Typography>

      <Card className="mb-6">
        <CardBody>
          <Typography variant="h6" color="blue" className="mb-4">
            Welcome back, {user?.full_name || user?.username || "User"}!
          </Typography>
          <Typography>
            This is your Test Flow dashboard where you can manage your tests and
            projects. Use the navigation menu to access different sections of
            the application.
          </Typography>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
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
          title="Tests"
          value={analyticsLoading ? "..." : testStatusData.total.toString()}
          description="Total tests"
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
          value={analyticsLoading ? "..." : testStatusData.tested.toString()}
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

      {/* Analytics Charts */}
      {!analyticsLoading && (
        <Grid container spacing={3}>
          {/* Project Activity Line Chart */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Activity (Last 30 Days)
              </Typography>
              <Box sx={{ height: 350, width: "100%" }}>
                {projectActivity.dates.length > 0 ? (
                  <LineChart
                    xAxis={[
                      {
                        data: projectActivity.dates.slice(-14),
                        scaleType: "point",
                        valueFormatter: (date) =>
                          new Date(date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          }),
                      },
                    ]}
                    series={[
                      {
                        data: projectActivity.test_counts.slice(-14),
                        label: "Tests",
                        color: "#2196F3",
                        showMark: true,
                        curve: "linear",
                      },
                      {
                        data: projectActivity.feature_counts.slice(-14),
                        label: "Features",
                        color: "#4CAF50",
                        showMark: true,
                        curve: "linear",
                      },
                    ]}
                    height={350}
                    margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
                    sx={{
                      ".MuiLineElement-root": {
                        strokeWidth: 2,
                      },
                      ".MuiMarkElement-root": {
                        stroke: "#fff",
                        strokeWidth: 2,
                        scale: "0.6",
                      },
                    }}
                  />
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                  >
                    <Typography color="text.secondary">
                      No activity data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Test Progress Area Chart */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Test Progress (Last 6 Months)
              </Typography>
              <Box sx={{ height: 350, width: "100%" }}>
                {testProgress.months.length > 0 ? (
                  <LineChart
                    xAxis={[
                      {
                        data: testProgress.months,
                        scaleType: "band",
                      },
                    ]}
                    series={[
                      {
                        data: testProgress.added,
                        label: "Tests Added",
                        color: "#FF9800",
                        area: true,
                        showMark: true,
                      },
                      {
                        data: testProgress.completed,
                        label: "Tests Completed",
                        color: "#4CAF50",
                        area: true,
                        showMark: true,
                      },
                    ]}
                    height={350}
                    margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
                    sx={{
                      ".MuiAreaElement-root": {
                        fillOpacity: 0.3,
                      },
                      ".MuiMarkElement-root": {
                        stroke: "#fff",
                        strokeWidth: 2,
                        scale: "0.6",
                      },
                    }}
                  />
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                  >
                    <Typography color="text.secondary">
                      No progress data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Test Status and Priority Charts in a row */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Test Status
              </Typography>
              <Box sx={{ height: 300, width: "100%" }}>
                {testStatusData.total > 0 ? (
                  <PieChart
                    series={[
                      {
                        data: [
                          {
                            id: 0,
                            value: testStatusData.tested,
                            label: "Tested",
                            color: "#4CAF50",
                          },
                          {
                            id: 1,
                            value: testStatusData.untested,
                            label: "Untested",
                            color: "#FF9800",
                          },
                        ],
                        innerRadius: 30,
                        outerRadius: 100,
                        paddingAngle: 2,
                        cornerRadius: 5,
                        startAngle: -90,
                        endAngle: 270,
                        cx: 150,
                        cy: 150,
                      },
                    ]}
                    height={300}
                  />
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                  >
                    <Typography color="text.secondary">
                      No test data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Test Priority Bar Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Test Priority Distribution
              </Typography>
              <Box sx={{ height: 300, width: "100%" }}>
                {testPriorityData.total > 0 ? (
                  <BarChart
                    xAxis={[
                      { scaleType: "band", data: ["High", "Normal", "Low"] },
                    ]}
                    series={[
                      {
                        data: [
                          testPriorityData.high,
                          testPriorityData.normal,
                          testPriorityData.low,
                        ],
                        color: "#2196F3",
                      },
                    ]}
                    height={300}
                  />
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                  >
                    <Typography color="text.secondary">
                      No priority data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

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
            Create your first project to start managing tests
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
