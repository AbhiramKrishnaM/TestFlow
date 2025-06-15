import { Test } from "../components/flow/nodes/TestNode";
import { apiClient } from "./api-client";
import { PriorityTest } from "../components/flow/nodes/HighPriorityTestNode";

// In a real application, this would interact with a backend API
// For now, we'll use local storage to persist tests

export interface TestCreateDto {
  name: string;
  feature_id: number;
  priority?: "high" | "low" | "normal";
}

// Simple UUID generator
const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

class TestService {
  private apiUrl = "/tests";

  async getFeatureTests(featureId: string): Promise<Test[]> {
    try {
      const response = await apiClient.get(
        `${this.apiUrl}/feature/${featureId}`
      );
      return response.data.map((test: any) => ({
        id: test.id.toString(),
        name: test.name,
        featureId: test.feature_id.toString(),
        tested: test.tested,
        priority: test.priority || "normal",
      }));
    } catch (error) {
      console.error("Error fetching feature tests:", error);
      return [];
    }
  }

  async getAllTests(): Promise<Test[]> {
    try {
      const response = await apiClient.get(this.apiUrl);
      console.log("Raw test API response:", response.data);

      return response.data.map((test: any) => ({
        id: test.id.toString(),
        name: test.name,
        featureId: test.feature_id.toString(),
        tested: test.tested,
        priority: test.priority || "normal",
      }));
    } catch (error) {
      console.error("Error fetching all tests:", error);
      return [];
    }
  }

  async createTest(testData: TestCreateDto): Promise<Test | null> {
    try {
      const response = await apiClient.post(this.apiUrl, {
        name: testData.name,
        feature_id: testData.feature_id,
        tested: false,
        priority: testData.priority || "normal",
      });

      return {
        id: response.data.id.toString(),
        name: response.data.name,
        featureId: response.data.feature_id.toString(),
        tested: response.data.tested,
        priority: response.data.priority || "normal",
      };
    } catch (error) {
      console.error("Error creating test:", error);
      return null;
    }
  }

  async updateTest(id: string, updates: Partial<Test>): Promise<Test | null> {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.tested !== undefined) payload.tested = updates.tested;
      if (updates.priority !== undefined) payload.priority = updates.priority;

      const response = await apiClient.put(`${this.apiUrl}/${id}`, payload);

      return {
        id: response.data.id.toString(),
        name: response.data.name,
        featureId: response.data.feature_id.toString(),
        tested: response.data.tested,
        priority: response.data.priority || "normal",
      };
    } catch (error) {
      console.error("Error updating test:", error);
      return null;
    }
  }

  async deleteTest(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.apiUrl}/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting test:", error);
      return false;
    }
  }

  async toggleTestStatus(id: string): Promise<Test | null> {
    try {
      const response = await apiClient.patch(`${this.apiUrl}/${id}/toggle`);

      return {
        id: response.data.id.toString(),
        name: response.data.name,
        featureId: response.data.feature_id.toString(),
        tested: response.data.tested,
        priority: response.data.priority || "normal",
      };
    } catch (error) {
      console.error("Error toggling test status:", error);
      return null;
    }
  }
}

export const testService = new TestService();
