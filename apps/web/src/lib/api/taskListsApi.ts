import { CreateTaskList, TaskList, TaskListAccess } from '@todoiti/common';
import { axiosInstance } from './axios';

export const getTaskList = async (taskListId: string) => {
  try {
    const response = await axiosInstance.get<TaskList>(`/v1/task-lists/${taskListId}`);
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

export const createTaskList = async (payload: CreateTaskList) => {
  try {
    const response = await axiosInstance.post<{ id: string }>(`/v1/task-lists`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const updateTaskList = async (
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
    console.error(`error fetching task list: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const setTaskListStatus = async (taskListId: string, status: TaskList['status']) => {
  try {
    const response = await axiosInstance.post<{ success: boolean }>(`/v1/task-lists/${taskListId}/${status}`);
    return response.data;
  } catch (error: any) {
    console.error(`error setting task list done: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const deleteTaskList = async (taskListId: string) => {
  try {
    const response = await axiosInstance.delete<{ success: boolean }>(`/v1/task-lists/${taskListId}`);
    return response.data;
  } catch (error: any) {
    console.error(`error deleting task list: ${error?.response?.data || error?.message}`);
    throw error;
  }
};
