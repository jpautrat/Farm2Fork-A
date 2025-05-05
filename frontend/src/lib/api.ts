import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Constants for retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and retries
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retry?: number };
    
    // Initialize retry count if not present
    if (config && !config._retry) {
      config._retry = 0;
    }
    
    // Check if we should retry the request
    if (
      config &&
      config._retry !== undefined &&
      config._retry < MAX_RETRIES &&
      error.response &&
      RETRY_STATUS_CODES.includes(error.response.status)
    ) {
      config._retry += 1;
      
      // Log retry attempt
      console.log(`Retrying request (${config._retry}/${MAX_RETRIES}): ${config.url}`);
      
      // Wait before retrying (exponential backoff)
      const delay = RETRY_DELAY * Math.pow(2, config._retry - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      // Retry the request
      return api(config);
    }
    
    // If we shouldn't retry or have exhausted retries, reject with the error
    return Promise.reject(error);
  }
);

// Helper function to detect network status
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// API wrapper functions with offline detection
export const apiClient = {
  /**
   * Make a GET request
   * @param url - The URL to request
   * @param config - Optional axios config
   * @returns Promise with the response data
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (!isOnline()) {
      throw new Error('You are offline. Please check your internet connection and try again.');
    }
    
    try {
      const response: AxiosResponse<T> = await api.get(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Make a POST request
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Optional axios config
   * @returns Promise with the response data
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (!isOnline()) {
      throw new Error('You are offline. Please check your internet connection and try again.');
    }
    
    try {
      const response: AxiosResponse<T> = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Make a PUT request
   * @param url - The URL to request
   * @param data - The data to send
   * @param config - Optional axios config
   * @returns Promise with the response data
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (!isOnline()) {
      throw new Error('You are offline. Please check your internet connection and try again.');
    }
    
    try {
      const response: AxiosResponse<T> = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Make a DELETE request
   * @param url - The URL to request
   * @param config - Optional axios config
   * @returns Promise with the response data
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (!isOnline()) {
      throw new Error('You are offline. Please check your internet connection and try again.');
    }
    
    try {
      const response: AxiosResponse<T> = await api.delete(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

/**
 * Handle API errors consistently
 * @param error - The error from axios
 */
function handleApiError(error: any): void {
  if (axios.isAxiosError(error)) {
    // Handle specific error cases
    if (!error.response) {
      console.error('Network error: No response from server');
    } else {
      // Log based on status code
      const status = error.response.status;
      
      if (status === 401) {
        console.error('Authentication error: Please log in again');
        // Could trigger a logout or redirect to login here
      } else if (status === 403) {
        console.error('Authorization error: You do not have permission to access this resource');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status >= 500) {
        console.error('Server error:', error.response.data);
      } else {
        console.error('API error:', error.response.data);
      }
    }
  } else {
    console.error('Unexpected error:', error);
  }
}

export default apiClient;
