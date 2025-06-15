import React, { useState, useEffect } from "react";
import { Project } from "../../services/project.service";
import { Feature, featureService } from "../../services/feature.service";
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import { useSnackbar } from "../../contexts/SnackbarContext";

interface ProjectSidebarProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onAddFeature: (
    featureName: string,
    description?: string
  ) => Promise<Feature | null>;
  onFeaturesUpdated?: () => Promise<void>;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  project,
  isOpen,
  onClose,
  onAddFeature,
  onFeaturesUpdated,
}) => {
  const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);
  const [isEditFeatureModalOpen, setIsEditFeatureModalOpen] = useState(false);
  const [featureName, setFeatureName] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featureNameError, setFeatureNameError] = useState("");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
    null
  );

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (isOpen && project) {
      loadFeatures();
    }
  }, [isOpen, project]);

  const loadFeatures = async () => {
    try {
      const projectFeatures = await featureService.getProjectFeatures(
        project.id
      );
      setFeatures(projectFeatures);
    } catch (error) {
      console.error("Error loading features:", error);
      showSnackbar("Failed to load features", "error");
    }
  };

  const handleAddFeatureClick = () => {
    setIsAddFeatureModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddFeatureModalOpen(false);
    setIsEditFeatureModalOpen(false);
    setFeatureName("");
    setFeatureDescription("");
    setFeatureNameError("");
    setSelectedFeature(null);
  };

  const handleSubmitFeature = async () => {
    if (!featureName.trim()) {
      setFeatureNameError("Feature name is required");
      return;
    }

    try {
      const newFeature = await onAddFeature(
        featureName.trim(),
        featureDescription.trim() || undefined
      );

      if (newFeature) {
        setFeatures((prev) => [...prev, newFeature]);
      }

      if (onFeaturesUpdated) await onFeaturesUpdated();

      handleCloseModal();
    } catch (error) {
      console.error("Error adding feature:", error);
      showSnackbar("Failed to add feature", "error");
    }
  };

  const handleFeatureMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    featureId: string
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedFeatureId(featureId);
  };

  const handleFeatureMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedFeatureId(null);
  };

  const handleEditFeature = () => {
    const feature = features.find((f) => f.id === selectedFeatureId);
    if (feature) {
      setSelectedFeature(feature);
      setFeatureName(feature.name);
      setFeatureDescription(feature.description || "");
      setIsEditFeatureModalOpen(true);
    }
    handleFeatureMenuClose();
  };

  const handleDeleteFeature = async () => {
    if (!selectedFeatureId) return;

    try {
      const success = await featureService.deleteFeature(selectedFeatureId);
      if (success) {
        // Update local state directly
        setFeatures((prev) => prev.filter((f) => f.id !== selectedFeatureId));
        showSnackbar("Feature deleted successfully", "success");

        // Notify parent component to update flow
        if (onFeaturesUpdated) await onFeaturesUpdated();
      }
    } catch (error) {
      console.error("Error deleting feature:", error);
      showSnackbar("Failed to delete feature", "error");
    }

    handleFeatureMenuClose();
  };

  const handleUpdateFeature = async () => {
    if (!selectedFeature || !featureName.trim()) {
      setFeatureNameError("Feature name is required");
      return;
    }

    try {
      const updatedFeature = await featureService.updateFeature(
        selectedFeature.id,
        {
          name: featureName.trim(),
          description: featureDescription.trim() || undefined,
        }
      );

      if (updatedFeature) {
        // Update local state directly
        setFeatures((prev) =>
          prev.map((f) => (f.id === selectedFeature.id ? updatedFeature : f))
        );

        showSnackbar("Feature updated successfully", "success");

        // Notify parent component to update flow
        if (onFeaturesUpdated) await onFeaturesUpdated();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error updating feature:", error);
      showSnackbar("Failed to update feature", "error");
    }
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

      {/* Features Section */}
      <Box mb={3}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Features
        </Typography>
        {features.length > 0 ? (
          <List dense>
            {features.map((feature) => (
              <React.Fragment key={feature.id}>
                <ListItem>
                  <ListItemText
                    primary={feature.name}
                    secondary={feature.description || "No description"}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => handleFeatureMenuOpen(e, feature.id)}
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
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No features added yet
          </Typography>
        )}
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

      {/* Feature Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleFeatureMenuClose}
      >
        <MenuItem onClick={handleEditFeature}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteFeature}>Delete</MenuItem>
      </Menu>

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
          <TextField
            margin="dense"
            label="Description (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={featureDescription}
            onChange={(e) => setFeatureDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSubmitFeature} color="primary">
            Add Feature
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Feature Modal */}
      <Dialog open={isEditFeatureModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Edit Feature</DialogTitle>
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
          <TextField
            margin="dense"
            label="Description (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={featureDescription}
            onChange={(e) => setFeatureDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleUpdateFeature} color="primary">
            Update Feature
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
