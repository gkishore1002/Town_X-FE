import api from "./api";
import type { AuthResponse, User, UserRole } from "@/types/user";

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authAPI = {
  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/signup", payload);
    return response.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/login", payload);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>("/api/auth/me");
    return response.data;
  },
};

export default authAPI;
