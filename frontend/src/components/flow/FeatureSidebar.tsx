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
} from "@mui/material";
import { Feature } from "../../services/feature.service";
import { Test } from "./nodes/TestNode";
import { testService } from "../../services/test.service";

interface FeatureSidebarProps {
  feature: Feature | null;
  isOpen: boolean;
  onClose: () => void;
  onTestsUpdated: (updatedTest?: Test, isDelete?: boolean) => void;
}

export const FeatureSidebar: React.FC<FeatureSidebarProps> = ({
  feature,
  isOpen,
  onClose,
  onTestsUpdated,
}) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddTest = async () => {
    if (!feature || !newTestName.trim()) return;

    setSubmitting(true);
    try {
      const newTest = await testService.createTest({
        name: newTestName.trim(),
        feature_id: parseInt(feature.id.toString(), 10),
      });

      if (newTest) {
        setTests([...tests, newTest]);
        setNewTestName("");
        onTestsUpdated(newTest);
      }
    } catch (error) {
      console.error("Error adding test:", error);
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
      }
    } catch (error) {
      console.error("Error deleting test:", error);
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

          {feature.description && (
            <Typography variant="body2" color="text.secondary" mb={3}>
              {feature.description}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" mb={2}>
            Tests
          </Typography>

          <Box mb={3}>
            <TextField
              fullWidth
              label="Test Name"
              variant="outlined"
              size="small"
              value={newTestName}
              onChange={(e) => setNewTestName(e.target.value)}
              disabled={submitting}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 1 }}
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
            <Paper variant="outlined" sx={{ maxHeight: 400, overflow: "auto" }}>
              <List dense>
                {tests.map((test) => (
                  <ListItem
                    key={test.id}
                    button
                    onClick={() => handleToggleTestStatus(test.id)}
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
                      secondary={test.tested ? "Tested" : "Not tested"}
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
      ) : (
        <Typography variant="body1">No feature selected</Typography>
      )}
    </Drawer>
  );
};
