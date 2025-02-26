import { TaskList, TaskListWithTasks } from '@todoiti/common';
import { axiosInstance } from './axios';

export const getTaskList = async (taskListId: string, withTasks = false) => {
  try {
    const response = await axiosInstance.get<TaskListWithTasks>(`/v1/task-lists/${taskListId}`, {
      params: { withTasks },
    });
    return response.data;
  } catch (error: any) {
    console.error(`error fetching task ${taskListId}: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const getTaskLists = async () => {
  try {
    const response = await axiosInstance.get<TaskList[]>(`/v1/task-lists`);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const createTask = async (payload: Pick<TaskList, 'name' | 'description'>) => {
  try {
    const response = await axiosInstance.post<{ id: string }>(`/v1/task-lists`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const updateTask = async (
  taskListId: string,
  payload: Pick<TaskList, 'name' | 'description' | 'status'>
) => {
  try {
    const response = await axiosInstance.patch<{ success: true }>(
      `/v1/task-lists/${taskListId}`,
      payload
    );
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};
