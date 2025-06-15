import axios from "axios";
import { API_URL } from "../config/constants";

export interface TestStatusCount {
  tested: number;
  untested: number;
  total: number;
}

export interface TestPriorityCount {
  high: number;
  normal: number;
  low: number;
  total: number;
}

export interface FeatureTestCount {
  feature_id: number;
  feature_name: string;
  test_count: number;
  tested_count: number;
  untested_count: number;
}

export interface ProjectActivityData {
  dates: string[];
  test_counts: number[];
  feature_counts: number[];
}

export interface TestProgressData {
  months: string[];
  completed: number[];
  added: number[];
}

class AnalyticsService {
  async getTestStatusCounts(): Promise<TestStatusCount> {
    try {
      const response = await axios.get<TestStatusCount>(
        `${API_URL}/analytics/test-status`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching test status counts:", error);
      // Return default values in case of error
      return { tested: 0, untested: 0, total: 0 };
    }
  }

  async getTestPriorityCounts(): Promise<TestPriorityCount> {
    try {
      const response = await axios.get<TestPriorityCount>(
        `${API_URL}/analytics/test-priority`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching test priority counts:", error);
      // Return default values in case of error
      return { high: 0, normal: 0, low: 0, total: 0 };
    }
  }

  async getFeatureTestCounts(
    projectId?: number,
    limit: number = 5
  ): Promise<FeatureTestCount[]> {
    try {
      let url = `${API_URL}/analytics/feature-test-counts?limit=${limit}`;
      if (projectId) {
        url += `&project_id=${projectId}`;
      }
      const response = await axios.get<FeatureTestCount[]>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching feature test counts:", error);
      return [];
    }
  }

  async getProjectActivity(days: number = 30): Promise<ProjectActivityData> {
    try {
      const response = await axios.get<ProjectActivityData>(
        `${API_URL}/analytics/project-activity?days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching project activity:", error);
      return { dates: [], test_counts: [], feature_counts: [] };
    }
  }

  async getTestProgress(projectId?: number): Promise<TestProgressData> {
    try {
      let url = `${API_URL}/analytics/test-progress`;
      if (projectId) {
        url += `?project_id=${projectId}`;
      }
      const response = await axios.get<TestProgressData>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching test progress:", error);
      return { months: [], completed: [], added: [] };
    }
  }
}

export const analyticsService = new AnalyticsService();
