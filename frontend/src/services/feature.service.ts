import axios from "axios";
import { API_URL } from "../config/constants";

export interface Feature {
  id: string;
  name: string;
  description?: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFeatureDto {
  name: string;
  description?: string;
  project_id: number;
}

export interface UpdateFeatureDto {
  name?: string;
  description?: string;
}

class FeatureService {
  private featuresCache: Map<number, Feature[]> = new Map(); // projectId -> features

  async getProjectFeatures(projectId: number): Promise<Feature[]> {
    // Check if we have cached data first
    const cachedFeatures = this.featuresCache.get(projectId);
    if (cachedFeatures) {
      console.log(
        `Using cached features for project ${projectId}`,
        cachedFeatures
      );
      return cachedFeatures;
    }

    try {
      console.log(`Fetching features for project ${projectId} from API`);
      const response = await axios.get<Feature[]>(
        `${API_URL}/features/project/${projectId}`
      );
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

      return true;
    } catch (error) {
      console.error(`Error deleting feature ${featureId}:`, error);
      throw error;
    }
  }

  // Clear cache for a specific project
  clearProjectCache(projectId: number) {
    this.featuresCache.delete(projectId);
  }

  // Clear all cache
  clearCache() {
    this.featuresCache.clear();
  }
}

export const featureService = new FeatureService();
