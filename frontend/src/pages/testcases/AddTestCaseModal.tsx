import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { LoadingButton } from "../../components/ui/LoadingButton";

interface AddTestCaseModalProps {
  isOpen: boolean;
  projectId: number;
  onClose: () => void;
  onSubmit: (
    title: string,
    description: string,
    status: string,
    priority: string
  ) => Promise<void>;
}

export const AddTestCaseModal: React.FC<AddTestCaseModalProps> = ({
  isOpen,
  projectId,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [priority, setPriority] = useState("MEDIUM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title.trim()) {
      setTitleError("Test case title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(title.trim(), description.trim(), status, priority);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("PENDING");
    setPriority("MEDIUM");
    setTitleError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value as string);
  };

  const handlePriorityChange = (event: SelectChangeEvent) => {
    setPriority(event.target.value as string);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Test Case</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Test Case Title"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) {
                setTitleError("");
              }
            }}
            error={!!titleError}
            helperText={titleError}
            required
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PASS">Pass</MenuItem>
                <MenuItem value="FAIL">Fail</MenuItem>
                <MenuItem value="BLOCKED">Blocked</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                value={priority}
                label="Priority"
                onChange={handlePriorityChange}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Creating..."
            variant="contained"
            color="primary"
          >
            Create Test Case
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
