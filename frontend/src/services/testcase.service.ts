import axios from "axios";
import { API_URL } from "../config/constants";

export interface TestCase {
  id: number;
  title: string;
  description?: string;
  project_id: number;
  created_at: string;
  updated_at: string;
  status: "PASS" | "FAIL" | "PENDING" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface CreateTestCaseDto {
  title: string;
  description?: string;
  project_id: number;
  status?: "PASS" | "FAIL" | "PENDING" | "BLOCKED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

class TestCaseService {
  private testCasesCache: Map<number, TestCase[]> = new Map(); // projectId -> testCases
  private mockTestCases: Map<number, TestCase[]> = new Map(); // For demo purposes
  private lastTestCaseId = 1;

  constructor() {
    // Initialize with empty mock data
    this.mockTestCases = new Map();
  }

  async getProjectTestCases(projectId: number): Promise<TestCase[]> {
    // For now, return mock data as this endpoint isn't implemented yet
    // When the backend is ready, uncomment the code below

    /*
    try {
      const response = await axios.get<TestCase[]>(`${API_URL}/projects/${projectId}/testcases`);
      this.testCasesCache.set(projectId, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching test cases for project ${projectId}:`, error);
      return [];
    }
    */

    // Return mock data for now
    return this.mockTestCases.get(projectId) || [];
  }

  async createTestCase(
    testCaseData: CreateTestCaseDto
  ): Promise<TestCase | null> {
    // For now, create mock test case as this endpoint isn't implemented yet
    // When the backend is ready, uncomment the code below

    /*
    try {
      const response = await axios.post<TestCase>(`${API_URL}/testcases`, testCaseData);
      
      // Update cache
      const projectId = testCaseData.project_id;
      const cachedTestCases = this.testCasesCache.get(projectId) || [];
      this.testCasesCache.set(projectId, [...cachedTestCases, response.data]);
      
      return response.data;
    } catch (error) {
      console.error("Error creating test case:", error);
      throw error;
    }
    */

    // Create mock test case for now
    const newTestCase: TestCase = {
      id: this.lastTestCaseId++,
      title: testCaseData.title,
      description: testCaseData.description,
      project_id: testCaseData.project_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status:
        (testCaseData.status as "PASS" | "FAIL" | "PENDING" | "BLOCKED") ||
        "PENDING",
      priority:
        (testCaseData.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") ||
        "MEDIUM",
    };

    // Update mock data
    const projectId = testCaseData.project_id;
    const existingTestCases = this.mockTestCases.get(projectId) || [];
    this.mockTestCases.set(projectId, [...existingTestCases, newTestCase]);

    return newTestCase;
  }

  // Clear cache for a specific project
  clearProjectCache(projectId: number) {
    this.testCasesCache.delete(projectId);
    // For demo purposes, also clear mock data
    this.mockTestCases.delete(projectId);
  }

  // Clear all cache
  clearCache() {
    this.testCasesCache.clear();
    // For demo purposes, also clear all mock data
    this.mockTestCases.clear();
  }
}

export const testCaseService = new TestCaseService();
