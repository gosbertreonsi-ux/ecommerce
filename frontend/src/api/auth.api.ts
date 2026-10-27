import apiClient from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(
  payload: LoginPayload,
): Promise<AuthResponse> {

  const response =
    await apiClient.post<{
      success: boolean;
      message: string;
      data: AuthResponse;
    }>(
      "/auth/login",
      payload,
    );

  return response.data.data;
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {

  const response =
    await apiClient.post<{
      success: boolean;
      message: string;
      data: AuthUser;
    }>(
      "/auth/register",
      payload,
    );

  /*
   * Your current backend registration endpoint
   * returns the created user but does not return
   * a JWT token.
   *
   * We therefore return the user and leave the
   * token empty for now.
   */
  return {
    token: "",
    user: response.data.data,
  };
}