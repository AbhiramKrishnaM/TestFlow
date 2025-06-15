import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { Feature } from "../../services/feature.service";
import { Test } from "./nodes/TestNode";
import { testService } from "../../services/test.service";
import { useSnackbar } from "../../contexts/SnackbarContext";

interface TestCasesSidebarProps {
  feature: Feature | null;
  isOpen: boolean;
  onClose: () => void;
  onTestsUpdated: (updatedTest?: Test, isDelete?: boolean) => void;
  selectedPriority?: "high" | "normal" | "low" | null;
}

export const TestCasesSidebar: React.FC<TestCasesSidebarProps> = ({
  feature,
  isOpen,
  onClose,
  onTestsUpdated,
  selectedPriority = null,
}) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [newTestPriority, setNewTestPriority] = useState<
    "high" | "normal" | "low"
  >("normal");
  const [submitting, setSubmitting] = useState(false);
  const [filterPriority, setFilterPriority] = useState<
    "high" | "normal" | "low" | null
  >(null);
  const { showSnackbar } = useSnackbar();

  // Set the priority when the selectedPriority prop changes
  useEffect(() => {
    if (selectedPriority) {
      setNewTestPriority(selectedPriority);
      setFilterPriority(selectedPriority);
    } else {
      setFilterPriority(null);
    }
  }, [selectedPriority]);

  // Filter tests by priority if a filter is set
  const filteredTests = useMemo(() => {
    if (!filterPriority) {
      return tests;
    }
    return tests.filter((test) => test.priority === filterPriority);
  }, [tests, filterPriority]);

  // Fetch tests for the feature
  useEffect(() => {
    let isMounted = true;
    const fetchTests = async () => {
      if (!feature) return;

      setLoading(true);
      try {
        console.log("Fetching tests for feature:", feature.id);
        const featureTests = await testService.getFeatureTests(
          feature.id.toString()
        );
        if (isMounted) {
          setTests(featureTests);
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (isOpen && feature) {
      fetchTests();
    }

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [isOpen, feature]);

  const handleAddTest = async () => {
    if (!feature || !newTestName.trim()) return;

    setSubmitting(true);
    try {
      const newTest = await testService.createTest({
        name: newTestName.trim(),
        feature_id: parseInt(feature.id.toString(), 10),
        priority: newTestPriority,
      });

      if (newTest) {
        setTests([...tests, newTest]);
        setNewTestName("");
        // Keep the priority if filtering is active
        if (!filterPriority) {
          setNewTestPriority("normal");
        }
        onTestsUpdated(newTest);
        showSnackbar("Test added successfully", "success");
      }
    } catch (error) {
      console.error("Error adding test:", error);
      showSnackbar("Failed to add test", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTestStatus = async (testId: string) => {
    try {
      const updatedTest = await testService.toggleTestStatus(testId);
      if (updatedTest) {
        setTests(
          tests.map((test) => (test.id === testId ? updatedTest : test))
        );
        onTestsUpdated(updatedTest);
      }
    } catch (error) {
      console.error("Error toggling test status:", error);
      showSnackbar("Failed to update test status", "error");
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      const success = await testService.deleteTest(testId);
      if (success) {
        const deletedTest = tests.find((test) => test.id === testId);
        setTests(tests.filter((test) => test.id !== testId));
        if (deletedTest) {
          onTestsUpdated(deletedTest, true);
        } else {
          onTestsUpdated();
        }
        showSnackbar("Test deleted successfully", "success");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      showSnackbar("Failed to delete test", "error");
    }
  };

  const handleClearFilter = () => {
    setFilterPriority(null);
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 500 }, p: 3 },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">
          {feature ? `Tests for ${feature.name}` : "Tests"}
          {filterPriority && (
            <Box component="span" ml={1}>
              <Chip
                label={`${
                  filterPriority.charAt(0).toUpperCase() +
                  filterPriority.slice(1)
                } Priority`}
                color={
                  filterPriority === "high"
                    ? "error"
                    : filterPriority === "low"
                    ? "primary"
                    : "default"
                }
                size="small"
                onDelete={handleClearFilter}
              />
            </Box>
          )}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="24"
            height="24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </IconButton>
      </Box>

      <Box mb={3}>
        <TextField
          fullWidth
          label="Test Name"
          variant="outlined"
          size="small"
          value={newTestName}
          onChange={(e) => setNewTestName(e.target.value)}
          disabled={submitting}
          sx={{ mb: 2 }}
        />
        <Box display="flex" mb={2}>
          <FormControl fullWidth size="small" sx={{ mr: 1 }}>
            <InputLabel id="test-priority-label">Priority</InputLabel>
            <Select
              labelId="test-priority-label"
              id="test-priority"
              value={newTestPriority}
              label="Priority"
              onChange={(e) =>
                setNewTestPriority(e.target.value as "high" | "normal" | "low")
              }
              disabled={submitting || filterPriority !== null}
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddTest}
            disabled={!newTestName.trim() || submitting}
            sx={{ whiteSpace: "nowrap" }}
          >
            {submitting ? <CircularProgress size={24} /> : "Add Test"}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredTests.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Test Case</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Switch
                        checked={test.tested}
                        onChange={() => handleToggleTestStatus(test.id)}
                        color="primary"
                      />
                      <Box
                        sx={{
                          ml: 1,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: test.tested ? "success.main" : "error.main",
                          ...(test.tested
                            ? {}
                            : { animation: "blink 1.5s infinite" }),
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{test.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {test.tested ? "Tested" : "Not tested"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "inline-block",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        bgcolor:
                          test.priority === "high"
                            ? "#fee2e2"
                            : test.priority === "low"
                            ? "#dbeafe"
                            : "#f3f4f6",
                        color:
                          test.priority === "high"
                            ? "#b91c1c"
                            : test.priority === "low"
                            ? "#1d4ed8"
                            : "#4b5563",
                      }}
                    >
                      {test.priority || "normal"}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete test">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTest(test.id)}
                        color="error"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          width="18"
                          height="18"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          py={4}
        >
          {filterPriority
            ? `No ${filterPriority} priority tests found for this feature.`
            : "No tests added for this feature yet."}
        </Typography>
      )}
    </Drawer>
  );
};
