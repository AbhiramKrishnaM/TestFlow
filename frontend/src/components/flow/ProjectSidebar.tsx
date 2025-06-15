import React, { useState } from "react";
import { Project } from "../../services/project.service";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

interface ProjectSidebarProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onAddFeature: (featureName: string) => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  project,
  isOpen,
  onClose,
  onAddFeature,
}) => {
  const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);
  const [featureName, setFeatureName] = useState("");
  const [featureNameError, setFeatureNameError] = useState("");

  const handleAddFeatureClick = () => {
    setIsAddFeatureModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddFeatureModalOpen(false);
    setFeatureName("");
    setFeatureNameError("");
  };

  const handleSubmitFeature = () => {
    if (!featureName.trim()) {
      setFeatureNameError("Feature name is required");
      return;
    }

    onAddFeature(featureName.trim());
    handleCloseModal();
  };

  if (!isOpen) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        right: 0,
        top: 0,
        height: "100%",
        width: "300px",
        zIndex: 10,
        padding: 2,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        borderLeft: "1px solid #e0e0e0",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Project Details</Typography>
        <IconButton onClick={onClose} size="small">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="20"
            height="20"
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

      <Typography variant="h5" mb={1}>
        {project.name}
      </Typography>

      <Box mb={3}>
        <Typography variant="subtitle2" color="text.secondary">
          Project Description
        </Typography>
        <Typography variant="body2">
          {project.description || "No description provided"}
        </Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle2" color="text.secondary">
          Overall Test Performance
        </Typography>
        <Typography variant="h4" color="primary">
          0%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No test results available
        </Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle2" color="text.secondary">
          Created
        </Typography>
        <Typography variant="body2">
          {new Date(project.created_at).toLocaleDateString()}
        </Typography>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle2" color="text.secondary">
          Last Updated
        </Typography>
        <Typography variant="body2">
          {project.updated_at
            ? new Date(project.updated_at).toLocaleDateString()
            : "N/A"}
        </Typography>
      </Box>

      <Box mt="auto" pt={2} borderTop="1px solid #e0e0e0">
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="20"
              height="20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          }
          onClick={handleAddFeatureClick}
        >
          Add Feature
        </Button>
      </Box>

      {/* Add Feature Modal */}
      <Dialog open={isAddFeatureModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Add New Feature</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Feature Name"
            type="text"
            fullWidth
            variant="outlined"
            value={featureName}
            onChange={(e) => {
              setFeatureName(e.target.value);
              if (e.target.value.trim()) {
                setFeatureNameError("");
              }
            }}
            error={!!featureNameError}
            helperText={featureNameError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSubmitFeature} color="primary">
            Add Feature
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
