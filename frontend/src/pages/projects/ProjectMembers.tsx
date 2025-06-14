import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import { projectService, User } from "../../services/project.service";
import { userService } from "../../services/user.service";

interface ProjectMembersProps {
  projectId: number;
}

export const ProjectMembers: React.FC<ProjectMembersProps> = ({
  projectId,
}) => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch project members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const members = await projectService.getProjectMembers(projectId);
        setMembers(members);
        setError(null);
      } catch (err) {
        setError("Failed to load project members");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const results = await userService.searchUsers(searchQuery);
        // Filter out users who are already members
        const filteredResults = results.filter(
          (user) => !members.some((member) => member.id === user.id)
        );
        setSearchResults(filteredResults);
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, members]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSearchQuery("");
    setSelectedUser(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;

    try {
      const updatedProject = await projectService.addProjectMember(
        projectId,
        selectedUser.id
      );
      if (updatedProject && updatedProject.members) {
        setMembers(updatedProject.members);
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Error adding member:", err);
      setError("Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      const updatedProject = await projectService.removeProjectMember(
        projectId,
        userId
      );
      if (updatedProject && updatedProject.members) {
        setMembers(updatedProject.members);
      } else {
        // Fallback if the API doesn't return updated members
        setMembers(members.filter((member) => member.id !== userId));
      }
    } catch (err) {
      console.error("Error removing member:", err);
      setError("Failed to remove member");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Project Members</Typography>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          + Add Member
        </Button>
      </Box>

      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      {members.length === 0 ? (
        <Typography
          variant="body1"
          color="textSecondary"
          textAlign="center"
          py={4}
        >
          No members in this project yet
        </Typography>
      ) : (
        <List>
          {members.map((member) => (
            <React.Fragment key={member.id}>
              <ListItem>
                <ListItemText
                  primary={member.full_name}
                  secondary={member.email}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    ×
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Add Member Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Project Member</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={searchResults}
            loading={searchLoading}
            getOptionLabel={(option) => `${option.full_name} (${option.email})`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search users"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {searchLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
            value={selectedUser}
            onChange={(_, newValue) => {
              setSelectedUser(newValue);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddMember}
            color="primary"
            disabled={!selectedUser}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
