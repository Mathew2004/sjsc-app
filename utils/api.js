import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get the API base URL from app.json
const API_BASE_URL = Constants.expoConfig?.extra?.API || 'https://sjsc-backend-production.up.railway.app/api/v1';
// const API_BASE_URL = 'http://192.168.0.104:3000/api/v1';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, you could handle logout here
      console.error('Unauthorized access - token might be expired');
    }
    return Promise.reject(error);
  }
);

// Utility functions for common API operations
export const api = {
  // GET request
  get: (url, config = {}) => apiClient.get(url, config),
  
  // POST request
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  
  // PUT request
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // For file uploads (multipart/form-data)
  upload: (url, formData, config = {}) => {
    return apiClient.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Helper function to get teacher ID
export const getTeacherId = async () => {
  try {
    return await AsyncStorage.getItem('teacher-id');
  } catch (error) {
    console.error('Error getting teacher ID:', error);
    return null;
  }
};

// Helper function to get token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Export the API base URL for cases where it's needed directly
export const API_URL = API_BASE_URL;

export default api;