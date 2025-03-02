import { Invite } from '@todoiti/common';
import { axiosInstance } from './axios';

export const getInviteByHash = async (hash: string) => {
  try {
    const response = await axiosInstance.get<Invite>(`/v1/invites/${hash}`);
    return response.data;
  } catch (error: any) {
    console.error(`error fetching invite ${hash}: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const acceptInvite = async (hash: string) => {
  try {
    const response = await axiosInstance.post<{ taskListId: string }>(`/v1/invites/accept/${hash}`);
    return response.data;
  } catch (error: any) {
    console.error(`error accepting invite ${hash}: ${error?.response?.data || error?.message}`);
    throw error;
  }
};

export const createInvite = async (taskListId: string) => {
  try {
    const response = await axiosInstance.post<{ link: string }>(`/v1/invites/${taskListId}`);
    return response.data;
  } catch (error: any) {
    console.error(
      `error generating invite ${taskListId}: ${error?.response?.data || error?.message}`
    );
    throw error;
  }
};
