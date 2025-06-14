import axios from "axios";
import { API_URL } from "../config/constants";

export interface User {
  id: number;
  email: string;
  full_name: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  owner_id: number;
  members?: User[];
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

// Set this to true to use mock data instead of making actual API calls
const USE_MOCK_API = true;

// Mock data for testing
const mockProjects: Project[] = [];
const mockUsers: User[] = [
  { id: 1, email: "admin@testtrack.com", full_name: "Admin User" },
  { id: 2, email: "user@testtrack.com", full_name: "Regular User" },
];

class ProjectService {
  async getProjects(): Promise<Project[]> {
    if (USE_MOCK_API) {
      console.log("Using mock API for getProjects");
      return [...mockProjects];
    }

    try {
      const response = await axios.get<Project[]>(`${API_URL}/projects`);
      return response.data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }

  async getProject(id: number): Promise<Project | null> {
    if (USE_MOCK_API) {
      console.log(`Using mock API for getProject(${id})`);
      const project = mockProjects.find((p) => p.id === id);
      return project || null;
    }

    try {
      const response = await axios.get<Project>(`${API_URL}/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      return null;
    }
  }

  async createProject(projectData: CreateProjectDto): Promise<Project | null> {
    if (USE_MOCK_API) {
      console.log("Using mock API for createProject", projectData);
      const newProject: Project = {
        id: mockProjects.length + 1,
        name: projectData.name,
        description: projectData.description || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner_id: 1, // Mock user ID
        members: [],
      };
      mockProjects.push(newProject);
      return newProject;
    }

    try {
      const response = await axios.post<Project>(
        `${API_URL}/projects`,
        projectData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  async updateProject(
    id: number,
    projectData: Partial<CreateProjectDto>
  ): Promise<Project | null> {
    if (USE_MOCK_API) {
      console.log(`Using mock API for updateProject(${id})`, projectData);
      const projectIndex = mockProjects.findIndex((p) => p.id === id);
      if (projectIndex === -1) return null;

      const updatedProject = {
        ...mockProjects[projectIndex],
        ...projectData,
        updated_at: new Date().toISOString(),
      };
      mockProjects[projectIndex] = updatedProject;
      return updatedProject;
    }

    try {
      const response = await axios.put<Project>(
        `${API_URL}/projects/${id}`,
        projectData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }

  async deleteProject(id: number): Promise<boolean> {
    if (USE_MOCK_API) {
      console.log(`Using mock API for deleteProject(${id})`);
      const projectIndex = mockProjects.findIndex((p) => p.id === id);
      if (projectIndex === -1) return false;

      mockProjects.splice(projectIndex, 1);
      return true;
    }

    try {
      await axios.delete(`${API_URL}/projects/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }

  async addProjectMember(
    projectId: number,
    userId: number
  ): Promise<Project | null> {
    if (USE_MOCK_API) {
      console.log(
        `Using mock API for addProjectMember(${projectId}, ${userId})`
      );
      const projectIndex = mockProjects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) return null;

      const user = mockUsers.find((u) => u.id === userId);
      if (!user) return null;

      if (!mockProjects[projectIndex].members) {
        mockProjects[projectIndex].members = [];
      }

      // Check if user is already a member
      if (!mockProjects[projectIndex].members!.some((m) => m.id === userId)) {
        mockProjects[projectIndex].members!.push(user);
      }

      return mockProjects[projectIndex];
    }

    try {
      const response = await axios.post<Project>(
        `${API_URL}/projects/${projectId}/members/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error adding member ${userId} to project ${projectId}:`,
        error
      );
      throw error;
    }
  }

  async removeProjectMember(
    projectId: number,
    userId: number
  ): Promise<Project | null> {
    if (USE_MOCK_API) {
      console.log(
        `Using mock API for removeProjectMember(${projectId}, ${userId})`
      );
      const projectIndex = mockProjects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) return null;

      if (!mockProjects[projectIndex].members)
        return mockProjects[projectIndex];

      mockProjects[projectIndex].members = mockProjects[
        projectIndex
      ].members!.filter((m) => m.id !== userId);

      return mockProjects[projectIndex];
    }

    try {
      const response = await axios.delete<Project>(
        `${API_URL}/projects/${projectId}/members/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error removing member ${userId} from project ${projectId}:`,
        error
      );
      throw error;
    }
  }

  async getProjectMembers(projectId: number): Promise<User[]> {
    if (USE_MOCK_API) {
      console.log(`Using mock API for getProjectMembers(${projectId})`);
      const project = mockProjects.find((p) => p.id === projectId);
      return project?.members || [];
    }

    try {
      const response = await axios.get<Project>(
        `${API_URL}/projects/${projectId}`
      );
      return response.data.members || [];
    } catch (error) {
      console.error(`Error fetching members for project ${projectId}:`, error);
      return [];
    }
  }
}

export const projectService = new ProjectService();
