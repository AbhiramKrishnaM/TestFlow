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

class ProjectService {
  private projectsCache: Project[] | null = null;
  private projectCache: Map<number, Project> = new Map();
  private fetchingProjects = false;
  private lastFetchTime = 0;

  async getProjects(): Promise<Project[]> {
    // Return cached projects if available
    if (this.projectsCache !== null) {
      console.log("Returning cached projects");
      return this.projectsCache;
    }

    // If already fetching, wait until complete
    if (this.fetchingProjects) {
      console.log("Already fetching projects, waiting...");
      return new Promise((resolve) => {
        const checkCache = () => {
          if (this.projectsCache !== null) {
            resolve(this.projectsCache);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    try {
      this.fetchingProjects = true;
      console.log("Fetching projects from API");
      const response = await axios.get<Project[]>(`${API_URL}/projects`);
      this.projectsCache = response.data;
      this.lastFetchTime = Date.now();
      return response.data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    } finally {
      this.fetchingProjects = false;
    }
  }

  async getProject(id: number): Promise<Project | null> {
    // Return cached project if available
    if (this.projectCache.has(id)) {
      return this.projectCache.get(id) || null;
    }

    try {
      const response = await axios.get<Project>(`${API_URL}/projects/${id}`);
      this.projectCache.set(id, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      return null;
    }
  }

  async createProject(projectData: CreateProjectDto): Promise<Project | null> {
    try {
      const response = await axios.post<Project>(
        `${API_URL}/projects`,
        projectData
      );

      // Update cache
      if (this.projectsCache) {
        this.projectsCache = [...this.projectsCache, response.data];
      } else {
        this.projectsCache = [response.data];
      }

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
    try {
      const response = await axios.put<Project>(
        `${API_URL}/projects/${id}`,
        projectData
      );

      // Update caches
      if (this.projectsCache) {
        this.projectsCache = this.projectsCache.map((p) =>
          p.id === id ? response.data : p
        );
      }

      if (this.projectCache.has(id)) {
        this.projectCache.set(id, response.data);
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/projects/${id}`);

      // Update caches
      this.projectsCache = null; // Force a fresh fetch next time
      this.projectCache.delete(id);

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
    try {
      const response = await axios.post<Project>(
        `${API_URL}/projects/${projectId}/members/${userId}`
      );

      // Update caches
      if (this.projectsCache) {
        this.projectsCache = this.projectsCache.map((p) =>
          p.id === projectId ? response.data : p
        );
      }

      if (this.projectCache.has(projectId)) {
        this.projectCache.set(projectId, response.data);
      }

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
    try {
      const response = await axios.delete<Project>(
        `${API_URL}/projects/${projectId}/members/${userId}`
      );

      // Update caches
      if (this.projectsCache) {
        this.projectsCache = this.projectsCache.map((p) =>
          p.id === projectId ? response.data : p
        );
      }

      if (this.projectCache.has(projectId)) {
        this.projectCache.set(projectId, response.data);
      }

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
    try {
      // Check if we have the project in cache with members
      const cachedProject = this.projectCache.get(projectId);
      if (cachedProject && cachedProject.members) {
        return cachedProject.members;
      }

      const response = await axios.get<Project>(
        `${API_URL}/projects/${projectId}`
      );

      // Update project cache
      this.projectCache.set(projectId, response.data);

      return response.data.members || [];
    } catch (error) {
      console.error(`Error fetching members for project ${projectId}:`, error);
      return [];
    }
  }

  // Get the timestamp of when projects were last fetched
  getLastFetchTime(): number {
    return this.lastFetchTime;
  }

  // Method to clear cache (useful for testing or after logout)
  clearCache() {
    this.projectsCache = null;
    this.projectCache.clear();
    this.fetchingProjects = false;
  }
}

export const projectService = new ProjectService();
