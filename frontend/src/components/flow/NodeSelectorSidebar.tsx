import React, { useState } from "react";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

interface NodeSelectorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNodeType: (nodeType: string) => void;
}

export const NodeSelectorSidebar: React.FC<NodeSelectorSidebarProps> = ({
  isOpen,
  onClose,
  onSelectNodeType,
}) => {
  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 300 }, p: 2 },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">Add Node</Typography>
      </Box>

      <Typography variant="subtitle2" color="text.secondary" mb={1}>
        Select node type to add
      </Typography>

      <List>
        <ListItem
          button
          onClick={() => onSelectNodeType("highPriorityTestNode")}
          sx={{
            mb: 1,
            borderRadius: 1,
            "&:hover": { bgcolor: "#fee2e2" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <div
              style={{
                backgroundColor: "#fee2e2",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ef4444",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#ef4444"
                width="16"
                height="16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </ListItemIcon>
          <ListItemText
            primary="High Priority Test"
            secondary="Add a high priority test to the selected feature"
          />
        </ListItem>

        <ListItem
          button
          onClick={() => onSelectNodeType("lowPriorityTestNode")}
          sx={{
            mb: 1,
            borderRadius: 1,
            "&:hover": { bgcolor: "#dbeafe" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <div
              style={{
                backgroundColor: "#dbeafe",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #3b82f6",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#3b82f6"
                width="16"
                height="16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </ListItemIcon>
          <ListItemText
            primary="Low Priority Test"
            secondary="Add a low priority test to the selected feature"
          />
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem
          button
          onClick={() => onSelectNodeType("testNode")}
          sx={{
            mb: 1,
            borderRadius: 1,
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <div
              style={{
                backgroundColor: "#f3f4f6",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #d1d5db",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#4b5563"
                width="16"
                height="16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </ListItemIcon>
          <ListItemText
            primary="Regular Test"
            secondary="Add a standard test to the selected feature"
          />
        </ListItem>
      </List>
    </Drawer>
  );
};
