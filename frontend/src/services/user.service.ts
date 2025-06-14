import axios from "axios";
import { API_URL } from "../config/constants";
import { User } from "./project.service";

class UserService {
  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get<User[]>(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  async getUser(id: number): Promise<User | null> {
    try {
      const response = await axios.get<User>(`${API_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
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
