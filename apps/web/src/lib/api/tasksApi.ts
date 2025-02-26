import axios from 'axios';
import { Task } from '@todoiti/common';
import { axiosInstance } from './axios';

export const getTask = async (id: string) => {
  try {
    return axiosInstance.get<Task>(`/tasks/${id}`);
  } catch (error: any) {
    console.error(`error fetching task ${id}: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const getTasks = async () => {
  try {
    const response = await axiosInstance.get<Task[]>(`/tasks`);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const createTask = async (payload: Pick<Task, 'name' | 'description'>) => {
  try {
    const response = await axiosInstance.post<{ id: string }>(`/task`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const updateTask = async (payload: Pick<Task, 'name' | 'description' | 'status'>) => {
  try {
    const response = await axiosInstance.patch<{ success: true }>(`/task`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};
