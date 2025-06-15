import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Divider,
  Paper,
  CircularProgress,
  Tooltip,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Feature, featureService } from "../../services/feature.service";
import { Test } from "./nodes/TestNode";
import { testService } from "../../services/test.service";
import { useSnackbar } from "../../contexts/SnackbarContext";

interface FeatureSidebarProps {
  feature: Feature | null;
  isOpen: boolean;
  onClose: () => void;
  onTestsUpdated: (updatedTest?: Test, isDelete?: boolean) => void;
  onFeaturesUpdated?: () => Promise<void>;
  initialTab?: number;
}

export const FeatureSidebar: React.FC<FeatureSidebarProps> = ({
  feature,
  isOpen,
  onClose,
  onTestsUpdated,
  onFeaturesUpdated,
  initialTab = 0,
}) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [newTestPriority, setNewTestPriority] = useState<
    "high" | "normal" | "low"
  >("normal");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [featureName, setFeatureName] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [newSubFeatureName, setNewSubFeatureName] = useState("");
  const [newSubFeatureDescription, setNewSubFeatureDescription] = useState("");
  const [subFeatures, setSubFeatures] = useState<Feature[]>([]);
  const { showSnackbar } = useSnackbar();

  // Initialize form fields and active tab when feature or initialTab changes
  useEffect(() => {
    if (feature) {
      setFeatureName(feature.name);
      setFeatureDescription(feature.description || "");
    }
    if (initialTab !== undefined) {
      setActiveTab(initialTab);
    }
  }, [feature, initialTab]);

  // Fetch tests for the feature
  useEffect(() => {
    let isMounted = true;
    const fetchTests = async () => {
      if (!feature) return;

      // Avoid refetching if we already have tests for this feature
      if (tests.length > 0 && tests[0].featureId === feature.id.toString()) {
        return;
      }

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
  }, [isOpen, feature?.id]); // Only depend on feature.id, not the entire feature object

  // Fetch sub-features
  useEffect(() => {
    let isMounted = true;
    const fetchSubFeatures = async () => {
      if (!feature) return;

      try {
        console.log("Fetching sub-features for feature:", feature.id);
        const childFeatures = await featureService.getProjectFeatures(
          feature.project_id,
          parseInt(feature.id)
        );
        if (isMounted) {
          setSubFeatures(childFeatures);
        }
      } catch (error) {
        console.error("Error fetching sub-features:", error);
      }
    };

    if (isOpen && feature) {
      fetchSubFeatures();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, feature]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
        setNewTestPriority("normal"); // Reset priority to default
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

  const handleUpdateFeature = async () => {
    if (!feature || !featureName.trim()) return;

    setSubmitting(true);
    try {
      const updatedFeature = await featureService.updateFeature(
        feature.id.toString(),
        {
          name: featureName.trim(),
          description: featureDescription.trim() || undefined,
        }
      );

      if (updatedFeature) {
        showSnackbar("Feature updated successfully", "success");

        // Notify parent component to update the flow
        if (onFeaturesUpdated) {
          await onFeaturesUpdated();
        }
      }
    } catch (error) {
      console.error("Error updating feature:", error);
      showSnackbar("Failed to update feature", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubFeature = async () => {
    if (!feature || !newSubFeatureName.trim()) return;

    setSubmitting(true);
    try {
      const newSubFeature = await featureService.createFeature({
        name: newSubFeatureName.trim(),
        description: newSubFeatureDescription.trim() || undefined,
        project_id: feature.project_id,
        parent_id: parseInt(feature.id),
      });

      if (newSubFeature) {
        setSubFeatures([...subFeatures, newSubFeature]);
        setNewSubFeatureName("");
        setNewSubFeatureDescription("");
        showSnackbar("Sub-feature added successfully", "success");

        // Notify parent component to update the flow
        if (onFeaturesUpdated) {
          await onFeaturesUpdated();
        }
      }
    } catch (error) {
      console.error("Error adding sub-feature:", error);
      showSnackbar("Failed to add sub-feature", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubFeature = async (subFeatureId: string) => {
    try {
      const success = await featureService.deleteFeature(subFeatureId);
      if (success) {
        setSubFeatures(subFeatures.filter((sf) => sf.id !== subFeatureId));
        showSnackbar("Sub-feature deleted successfully", "success");

        // Notify parent component to update the flow
        if (onFeaturesUpdated) {
          await onFeaturesUpdated();
        }
      }
    } catch (error) {
      console.error("Error deleting sub-feature:", error);
      showSnackbar("Failed to delete sub-feature", "error");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 400 }, p: 3 },
      }}
    >
      {feature ? (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Feature: {feature.name}</Typography>
            <IconButton onClick={onClose} size="small">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </IconButton>
          </Box>

          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Details" />
            <Tab label="Tests" />
            <Tab label="Sub-Features" />
          </Tabs>

          {/* Feature Details Tab */}
          {activeTab === 0 && (
            <Box>
              <TextField
                fullWidth
                label="Feature Name"
                variant="outlined"
                size="small"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                disabled={submitting}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                size="small"
                value={featureDescription}
                onChange={(e) => setFeatureDescription(e.target.value)}
                disabled={submitting}
                multiline
                rows={4}
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleUpdateFeature}
                disabled={!featureName.trim() || submitting}
              >
                {submitting ? <CircularProgress size={24} /> : "Update Feature"}
              </Button>
            </Box>
          )}

          {/* Tests Tab */}
          {activeTab === 1 && (
            <>
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
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="test-priority-label">Priority</InputLabel>
                  <Select
                    labelId="test-priority-label"
                    id="test-priority"
                    value={newTestPriority}
                    label="Priority"
                    onChange={(e) =>
                      setNewTestPriority(
                        e.target.value as "high" | "normal" | "low"
                      )
                    }
                    disabled={submitting}
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleAddTest}
                  disabled={!newTestName.trim() || submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : "Add Test"}
                </Button>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : tests.length > 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ maxHeight: 400, overflow: "auto" }}
                >
                  <List dense>
                    {tests.map((test) => (
                      <ListItem
                        key={test.id}
                        button
                        onClick={() => handleToggleTestStatus(test.id)}
                        sx={{
                          borderLeft: "4px solid",
                          borderLeftColor:
                            test.priority === "high"
                              ? "#ef4444"
                              : test.priority === "low"
                              ? "#3b82f6"
                              : "#e2e8f0",
                          mb: 0.5,
                        }}
                      >
                        <Box display="flex" alignItems="center" mr={1}>
                          {test.tested ? (
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: "success.main",
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: "error.main",
                                animation: "blink 1.5s infinite",
                              }}
                            />
                          )}
                        </Box>
                        <ListItemText
                          primary={test.name}
                          secondary={
                            <Box
                              component="span"
                              display="flex"
                              alignItems="center"
                            >
                              <Typography variant="caption" component="span">
                                {test.tested ? "Tested" : "Not tested"}
                              </Typography>
                              <Box
                                component="span"
                                sx={{
                                  display: "inline-block",
                                  px: 1,
                                  py: 0.25,
                                  ml: 1,
                                  borderRadius: 1,
                                  fontSize: "0.6rem",
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
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Delete test">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTest(test.id);
                              }}
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={4}
                >
                  No tests added for this feature yet.
                </Typography>
              )}
            </>
          )}

          {/* Sub-Features Tab */}
          {activeTab === 2 && (
            <>
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="Sub-Feature Name"
                  variant="outlined"
                  size="small"
                  value={newSubFeatureName}
                  onChange={(e) => setNewSubFeatureName(e.target.value)}
                  disabled={submitting}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  size="small"
                  value={newSubFeatureDescription}
                  onChange={(e) => setNewSubFeatureDescription(e.target.value)}
                  disabled={submitting}
                  multiline
                  rows={2}
                  margin="normal"
                />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={handleAddSubFeature}
                  disabled={!newSubFeatureName.trim() || submitting}
                >
                  {submitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Add Sub-Feature"
                  )}
                </Button>
              </Box>

              {subFeatures.length > 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ maxHeight: 400, overflow: "auto" }}
                >
                  <List dense>
                    {subFeatures.map((subFeature) => (
                      <ListItem key={subFeature.id}>
                        <ListItemText
                          primary={subFeature.name}
                          secondary={subFeature.description || "No description"}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Delete sub-feature">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() =>
                                handleDeleteSubFeature(subFeature.id)
                              }
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={4}
                >
                  No sub-features added yet.
                </Typography>
              )}
            </>
          )}
        </>
      ) : (
        <Typography variant="body1">No feature selected</Typography>
      )}
    </Drawer>
  );
};
