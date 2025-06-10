import axios from "axios";
import { API_URL } from "../config/constants";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

const AUTH_TOKEN_KEY = "auth_token";

class AuthService {
  private _user: User | null = null;

  constructor() {
    // Initialize auth headers if token exists
    const token = this.getToken();
    if (token) {
      this.setAuthHeader(token);
    }
  }

  async login(username: string, password: string): Promise<User> {
    // Create form data for OAuth2 password flow
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await axios.post<LoginResponse>(
      `${API_URL}/auth/login`,
      formData
    );

    const { access_token } = response.data;

    // Save token and set auth header
    localStorage.setItem(AUTH_TOKEN_KEY, access_token);
    this.setAuthHeader(access_token);

    // Get user profile
    return this.fetchUserProfile();
  }

  async register(data: RegisterData): Promise<User> {
    const response = await axios.post<User>(`${API_URL}/auth/register`, data);
    return response.data;
  }

  async fetchUserProfile(): Promise<User> {
    const response = await axios.get<User>(`${API_URL}/users/me`);
    this._user = response.data;
    return this._user;
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
    this._user = null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  getUser(): User | null {
    return this._user;
  }

  private setAuthHeader(token: string): void {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

export const authService = new AuthService();
