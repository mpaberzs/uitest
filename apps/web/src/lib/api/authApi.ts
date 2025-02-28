import { axiosInstance } from './axios';

export const login = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post<{ user: { id: string }; accessToken: string }>(
      `/v1/auth/login`,
      {
        email,
        password,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(`error logging in: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post<{ success: boolean }>(`/v1/auth/logout`, {});
    const { success } = response.data;
    if (success) {
      axiosInstance.defaults.headers.common['Authorization'] = '';
    }
    return response.data;
  } catch (error: any) {
    console.error(`error logging out: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const signup = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post<{ id: string }>(`/v1/auth/register`, {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    console.error(`error logging in: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const whoami = async () => {
  try {
    const response = await axiosInstance.get<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    }>('/v1/users/whoami');
    return response.data;
  } catch (error: any) {
    console.error(`error logging in: ${error?.response?.data || error?.message}`);
    throw error;
  }
};
