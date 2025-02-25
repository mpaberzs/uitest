import axios from 'axios';
import { Task } from '@todoiti/common';

const baseUrl = 'http://localhost:8000';

export const getTask = async (id: string) => {
  try {
    return axios.get<Task>(`${baseUrl}/tasks/${id}`);
  } catch (error: any) {
    console.error(`error fetching task ${id}: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const getTasks = async () => {
  try {
    const response = await axios.get<Task[]>(`${baseUrl}/tasks`);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const createTask = async (payload: Pick<Task, 'name' | 'description'>) => {
  try {
    const response = await axios.post<{ id: string }>(`${baseUrl}/task`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const updateTask = async (payload: Pick<Task, 'name' | 'description' | 'status'>) => {
  try {
    const response = await axios.patch<{ success: true }>(`${baseUrl}/task`, payload);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching tasks: ${error?.response?.data || error?.message}`);
    throw error;
  }
};
