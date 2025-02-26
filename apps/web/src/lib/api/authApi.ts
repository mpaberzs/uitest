import { axiosInstance } from './axios';

export const login = async (email: string, password: string) => {
  try {
    return axiosInstance.post<{ id: string }>(
      `/v1/auth/login`,
      { email, password },
    );
  } catch (error: any) {
    console.error(`error logging in: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const signup = async (email: string, password: string) => {
  try {
    return axiosInstance.post<{ id: string }>(
      `/v1/auth/register`,
      { email, password },
    );
  } catch (error: any) {
    console.error(`error logging in: ${error?.response?.data || error?.message}`);
    throw error;
  }
};
