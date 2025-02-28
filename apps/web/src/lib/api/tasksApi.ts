import { CreateTask, Task } from '@todoiti/common';
import { axiosInstance } from './axios';

export const getTask = async (id: string, taskListId: string) => {
  try {
    return axiosInstance.get<Task>(`/v1/tasks/${id}/${taskListId}`);
  } catch (error: any) {
    console.error(`error fetching task ${id}: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const getTasks = async (taskListId: string) => {
  try {
    const response = await axiosInstance.get<Task[]>(`/v1/tasks/${taskListId}`);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const createTask = async (taskListId: string, payload: CreateTask) => {
  try {
    const response = await axiosInstance.post<{ id: string }>(`/v1/tasks/${taskListId}`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const updateTask = async (
  taskListId: string,
  payload: Pick<Task, 'name' | 'description' | 'status'>
) => {
  try {
    const response = await axiosInstance.patch<{ success: true }>(
      `/v1/tasks/${taskListId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};
