import { apiClient } from "./api-client";
import { Node } from "reactflow";

export interface NodePosition {
  id: number;
  node_id: string;
  project_id: number;
  node_type: string;
  position_x: number;
  position_y: number;
  data?: any;
  created_at: string;
  updated_at?: string;
}

export interface NodePositionCreate {
  node_id: string;
  project_id: number;
  node_type: string;
  position_x: number;
  position_y: number;
  data?: any;
}

export interface NodePositionBulkCreate {
  project_id: number;
  positions: NodePositionCreate[];
}

class NodePositionService {
  // The apiClient already includes the /api/v1 prefix
  private apiUrl = "/node-positions";
  // Track in-flight save requests to prevent multiple concurrent saves
  private saveInProgress = false;

  async getProjectNodePositions(projectId: number): Promise<NodePosition[]> {
    try {
      const response = await apiClient.get(
        `${this.apiUrl}/project/${projectId}`
      );
      console.log("Loaded node positions from API:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching project node positions:", error);
      // Don't fail silently, log the error but return empty array
      console.log("Will use default positions instead");
      return [];
    }
  }

  async saveNodePositions(nodes: Node[], projectId: number): Promise<boolean> {
    // If a save is already in progress, skip this one
    if (this.saveInProgress) {
      console.log("Skipping node position save - another save in progress");
      return false;
    }

    try {
      this.saveInProgress = true;
      console.log("Saving positions for nodes:", nodes.length);

      // Convert ReactFlow nodes to NodePositionCreate objects
      const positions: NodePositionCreate[] = nodes.map((node) => {
        // Log each node position being saved
        console.log(`Saving node ${node.id} at position:`, node.position);

        return {
          node_id: node.id,
          project_id: projectId,
          node_type: node.type || "default",
          position_x: node.position.x,
          position_y: node.position.y,
          data: {
            // Only save essential data needed for reconstruction
            label: node.data?.label,
            featureId: node.data?.featureId,
            testCount: node.data?.testCount,
            // Don't save functions or complex objects
          },
        };
      });

      if (positions.length === 0) {
        console.log("No positions to save");
        return true;
      }

      // Send bulk create/update request
      const bulkData: NodePositionBulkCreate = {
        project_id: projectId,
        positions,
      };

      // Log the full URL and request data for debugging
      const fullUrl = `${this.apiUrl}/bulk`;
      console.log("Saving node positions to:", fullUrl);
      console.log("Request data:", JSON.stringify(bulkData));

      const response = await apiClient.post(fullUrl, bulkData);
      console.log("Position save response:", response);
      return true;
    } catch (error: any) {
      console.error("Error saving node positions:", error);
      if (error.response) {
        console.error(
          "Error response:",
          error.response.status,
          error.response.data
        );
      }
      return false;
    } finally {
      // Always reset the in-progress flag when done
      this.saveInProgress = false;
    }
  }

  async deleteProjectNodePositions(projectId: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.apiUrl}/project/${projectId}`);
      return true;
    } catch (error: any) {
      console.error("Error deleting project node positions:", error);
      return false;
    }
  }
}

export const nodePositionService = new NodePositionService();
