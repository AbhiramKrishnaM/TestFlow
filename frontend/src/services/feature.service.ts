import axios from "axios";
import { API_URL } from "../config/constants";

export interface Feature {
  id: string;
  name: string;
  description?: string;
  project_id: number;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureWithChildren extends Feature {
  children: FeatureWithChildren[];
}

export interface CreateFeatureDto {
  name: string;
  description?: string;
  project_id: number;
  parent_id?: number | null;
}

export interface UpdateFeatureDto {
  name?: string;
  description?: string;
  parent_id?: number | null;
}

class FeatureService {
  private featuresCache: Map<number, Feature[]> = new Map(); // projectId -> features
  private featureTreeCache: Map<number, FeatureWithChildren[]> = new Map(); // projectId -> feature tree

  async getProjectFeatures(
    projectId: number,
    parentId?: number | null
  ): Promise<Feature[]> {
    // Check if we have cached data first
    const cachedFeatures = this.featuresCache.get(projectId);
    if (cachedFeatures) {
      console.log(
        `Using cached features for project ${projectId}`,
        cachedFeatures
      );

      // If parentId is specified, filter the cached features
      if (parentId !== undefined) {
        return cachedFeatures.filter((f) => f.parent_id === parentId);
      }

      return cachedFeatures;
    }

    try {
      console.log(`Fetching features for project ${projectId} from API`);
      let url = `${API_URL}/features/project/${projectId}`;

      // If parentId is specified, add it as a query parameter
      if (parentId !== undefined) {
        url += `?parent_id=${parentId === null ? "null" : parentId}`;
      }

      const response = await axios.get<Feature[]>(url);
      console.log("Features response from API:", response.data);

      // Convert numeric IDs to strings if needed
      const processedFeatures = response.data.map((feature) => ({
        ...feature,
        id: String(feature.id),
      }));

      this.featuresCache.set(projectId, processedFeatures);
      return processedFeatures;
    } catch (error) {
      console.error(`Error fetching features for project ${projectId}:`, error);
      return [];
    }
  }

  async getProjectFeatureTree(
    projectId: number
  ): Promise<FeatureWithChildren[]> {
    // Check if we have cached data first
    const cachedFeatureTree = this.featureTreeCache.get(projectId);
    if (cachedFeatureTree) {
      console.log(
        `Using cached feature tree for project ${projectId}`,
        cachedFeatureTree
      );
      return cachedFeatureTree;
    }

    try {
      console.log(`Fetching feature tree for project ${projectId} from API`);
      const response = await axios.get<FeatureWithChildren[]>(
        `${API_URL}/features/project/${projectId}/tree`
      );
      console.log("Feature tree response from API:", response.data);

      // Convert numeric IDs to strings recursively
      const processFeature = (
        feature: FeatureWithChildren
      ): FeatureWithChildren => ({
        ...feature,
        id: String(feature.id),
        children: feature.children.map(processFeature),
      });

      const processedFeatureTree = response.data.map(processFeature);

      this.featureTreeCache.set(projectId, processedFeatureTree);
      return processedFeatureTree;
    } catch (error) {
      console.error(
        `Error fetching feature tree for project ${projectId}:`,
        error
      );
      return [];
    }
  }

  async createFeature(featureData: CreateFeatureDto): Promise<Feature | null> {
    try {
      const response = await axios.post<Feature>(
        `${API_URL}/features`,
        featureData
      );

      // Ensure ID is a string
      const feature = {
        ...response.data,
        id: String(response.data.id),
      };

      console.log("Created feature:", feature);

      // Update cache
      const projectId = featureData.project_id;
      const cachedFeatures = this.featuresCache.get(projectId) || [];
      this.featuresCache.set(projectId, [...cachedFeatures, feature]);

      // Clear feature tree cache since the hierarchy has changed
      this.featureTreeCache.delete(projectId);

      return feature;
    } catch (error) {
      console.error("Error creating feature:", error);
      throw error;
    }
  }

  async updateFeature(
    featureId: string,
    updateData: UpdateFeatureDto
  ): Promise<Feature | null> {
    try {
      const response = await axios.put<Feature>(
        `${API_URL}/features/${featureId}`,
        updateData
      );

      // Ensure ID is a string
      const feature = {
        ...response.data,
        id: String(response.data.id),
      };

      console.log("Updated feature:", feature);

      // Update cache if we have it
      const projectId = feature.project_id;
      const cachedFeatures = this.featuresCache.get(projectId);

      if (cachedFeatures) {
        const updatedFeatures = cachedFeatures.map((f) =>
          f.id === featureId ? feature : f
        );
        this.featuresCache.set(projectId, updatedFeatures);
      }

      // Clear feature tree cache since the hierarchy may have changed
      this.featureTreeCache.delete(projectId);

      return feature;
    } catch (error) {
      console.error(`Error updating feature ${featureId}:`, error);
      throw error;
    }
  }

  async deleteFeature(featureId: string): Promise<boolean> {
    try {
      const response = await axios.delete<Feature>(
        `${API_URL}/features/${featureId}`
      );

      // Ensure ID is a string
      const feature = {
        ...response.data,
        id: String(response.data.id),
      };

      console.log("Deleted feature:", feature);

      // Update cache if we have it
      const projectId = feature.project_id;
      const cachedFeatures = this.featuresCache.get(projectId);

      if (cachedFeatures) {
        const updatedFeatures = cachedFeatures.filter(
          (f) => f.id !== featureId
        );
        this.featuresCache.set(projectId, updatedFeatures);
      }

      // Clear feature tree cache since the hierarchy has changed
      this.featureTreeCache.delete(projectId);

      return true;
    } catch (error) {
      console.error(`Error deleting feature ${featureId}:`, error);
      throw error;
    }
  }

  // Clear cache for a specific project
  clearProjectCache(projectId: number) {
    this.featuresCache.delete(projectId);
    this.featureTreeCache.delete(projectId);
  }

  // Clear all cache
  clearCache() {
    this.featuresCache.clear();
    this.featureTreeCache.clear();
  }
}

export const featureService = new FeatureService();
