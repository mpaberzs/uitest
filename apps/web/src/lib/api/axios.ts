import axios, { AxiosError, AxiosResponse } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

const refreshAuthToken = async () => {
  try {
    const response = await axios.get<{ message: string; accessToken: string }>('/v1/auth/refresh', {
      // TODO: proper url
      baseURL: 'http://host.docker.internal:8000',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.log('doggo', error.request);
    console.error(error?.response?.data || error?.message);
    throw error;
  }
};

export const axiosInstance = axios.create({
  baseURL: 'http://host.docker.internal:8000',
  headers: {
    common: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },
  // FIXME: for some reason axios retry doesn't respect choice of separate instance for refreshing
  withCredentials: true,
});

export const axiosPublicInstance = axios.create({});

const refreshAuthLogic = (failedRequestError: AxiosError) => {
  return refreshAuthToken().then((token) => {
    failedRequestError.response!.config.headers['Authorization'] = `Bearer ${token.accessToken}`;
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.accessToken}`;
    return Promise.resolve();
  });
};

createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
  pauseInstanceWhileRefreshing: false,
  statusCodes: [401],
});
