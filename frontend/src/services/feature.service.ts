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

class FeatureService {
  private featuresCache: Map<number, Feature[]> = new Map(); // projectId -> features
  private mockFeatures: Map<number, Feature[]> = new Map(); // For demo purposes
  private lastFeatureId = 1;

  constructor() {
    // Initialize with empty mock data
    this.mockFeatures = new Map();
  }

  async getProjectFeatures(projectId: number): Promise<Feature[]> {
    // For now, return mock data as this endpoint isn't implemented yet
    // When the backend is ready, uncomment the code below

    /*
    try {
      const response = await axios.get<Feature[]>(`${API_URL}/projects/${projectId}/features`);
      this.featuresCache.set(projectId, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching features for project ${projectId}:`, error);
      return [];
    }
    */

    // Return mock data for now
    return this.mockFeatures.get(projectId) || [];
  }

  async createFeature(featureData: CreateFeatureDto): Promise<Feature | null> {
    // For now, create mock feature as this endpoint isn't implemented yet
    // When the backend is ready, uncomment the code below

    /*
    try {
      const response = await axios.post<Feature>(`${API_URL}/features`, featureData);
      
      // Update cache
      const projectId = featureData.project_id;
      const cachedFeatures = this.featuresCache.get(projectId) || [];
      this.featuresCache.set(projectId, [...cachedFeatures, response.data]);
      
      return response.data;
    } catch (error) {
      console.error("Error creating feature:", error);
      throw error;
    }
    */

    // Create mock feature for now
    const newFeature: Feature = {
      id: `feature-${this.lastFeatureId++}`,
      name: featureData.name,
      description: featureData.description,
      project_id: featureData.project_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update mock data
    const projectId = featureData.project_id;
    const existingFeatures = this.mockFeatures.get(projectId) || [];
    this.mockFeatures.set(projectId, [...existingFeatures, newFeature]);

    return newFeature;
  }

  // Clear cache for a specific project
  clearProjectCache(projectId: number) {
    this.featuresCache.delete(projectId);
    // For demo purposes, also clear mock data
    this.mockFeatures.delete(projectId);
  }

  // Clear all cache
  clearCache() {
    this.featuresCache.clear();
    // For demo purposes, also clear all mock data
    this.mockFeatures.clear();
  }
}

export const featureService = new FeatureService();
