import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://quadsync-events.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
  timeoutErrorMessage: 'Request timed out. Please check your connection.',
});

// Add request interceptor for better debugging
axiosInstance.interceptors.request.use(
  (config) => {
    const method = config.method?.toUpperCase();
    const url = config.url;
    console.log(`🚀 Making ${method} request to: ${url}`);
    
    // Log request data for POST requests (excluding sensitive info)
    if (method === 'POST' && config.data) {
      const safeData = { ...config.data };
      // Remove sensitive fields from logs
      if (safeData.email) safeData.email = '[REDACTED]';
      if (safeData.mobile) safeData.mobile = '[REDACTED]';
      console.log('📦 Request data:', safeData);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Received successful response from: ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // Enhanced error messages
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your internet connection.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    } else if (error.response.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
