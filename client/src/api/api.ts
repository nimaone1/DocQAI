import axios from 'axios'

const api = axios.create({
  baseURL: '',
  timeout: 10000,
})

// Add request interceptor to log all outgoing requests
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL || ''}${config.url}`,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log all responses
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      responseData: error.response?.data,
      responseText: typeof error.response?.data === 'string' ? error.response.data.substring(0, 200) : 'Not string data'
    });
    return Promise.reject(error);
  }
);

export default api