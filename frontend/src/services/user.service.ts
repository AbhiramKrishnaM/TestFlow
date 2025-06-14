import axios from "axios";
import { API_URL } from "../config/constants";
import { User } from "./project.service";

// Set this to true to use mock data instead of making actual API calls
const USE_MOCK_API = true;

// Mock data for testing
const mockUsers: User[] = [
  { id: 1, email: "admin@testtrack.com", full_name: "Admin User" },
  { id: 2, email: "user@testtrack.com", full_name: "Regular User" },
  { id: 3, email: "dev@testtrack.com", full_name: "Developer User" },
  { id: 4, email: "qa@testtrack.com", full_name: "QA User" },
];

class UserService {
  async getUsers(): Promise<User[]> {
    if (USE_MOCK_API) {
      console.log("Using mock API for getUsers");
      return [...mockUsers];
    }

    try {
      const response = await axios.get<User[]>(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  async getUser(id: number): Promise<User | null> {
    if (USE_MOCK_API) {
      console.log(`Using mock API for getUser(${id})`);
      const user = mockUsers.find((u) => u.id === id);
      return user || null;
    }

    try {
      const response = await axios.get<User>(`${API_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    if (USE_MOCK_API) {
      console.log(`Using mock API for searchUsers(${query})`);
      if (!query) return [];

      const lowerQuery = query.toLowerCase();
      return mockUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(lowerQuery) ||
          user.full_name.toLowerCase().includes(lowerQuery)
      );
    }

    try {
      const response = await axios.get<User[]>(
        `${API_URL}/users/search?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }
}

export const userService = new UserService();
