import axios from "axios";
import { API_URL } from "../config/constants";

export interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  owner_id: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

// Set this to true to use mock data instead of making actual API calls
const USE_MOCK_API = true;

// Mock data for testing
const mockProjects: Project[] = [];

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
}

export const projectService = new ProjectService();
