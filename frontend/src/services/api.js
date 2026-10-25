import axios from 'axios';

// Base URL configuration:
// 1. If VITE_API_URL is provided, normalize it (stripping trailing slashes and ensuring '/api' path).
// 2. If empty or omitted, defaults to '/api' to utilize the Vite development proxy.
const rawApiUrl = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).trim() : '';
const normalizeBaseURL = (url) => {
  if (!url) return '/api';
  const stripped = url.replace(/\/+$/, '');
  return stripped.endsWith('/api') ? stripped : `${stripped}/api`;
};

export const API_BASE_URL = normalizeBaseURL(rawApiUrl);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vpa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to handle token refresh automatically on 401 Unauthorized
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints (login, signup, refresh itself)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                           originalRequest.url?.includes('/auth/signup') || 
                           originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = localStorage.getItem('vpa_refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('vpa_token');
        localStorage.removeItem('vpa_refresh_token');
        localStorage.removeItem('vpa_user');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
        const { access_token, refresh_token: newRefreshToken, user } = res.data;
        
        localStorage.setItem('vpa_token', access_token);
        if (newRefreshToken) {
          localStorage.setItem('vpa_refresh_token', newRefreshToken);
        }
        if (user) {
          localStorage.setItem('vpa_user', JSON.stringify(user));
        }

        api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('vpa_token');
        localStorage.removeItem('vpa_refresh_token');
        localStorage.removeItem('vpa_user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password, confirmPassword) => 
    api.post('/auth/signup', { name, email, password, confirm_password: confirmPassword }),
  refreshToken: (refreshToken) => axios.post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const dashboardAPI = {
  getSummary: (params) => api.get('/dashboard/summary', { params }),
};

export const vendorAPI = {
  getVendors: (params) => api.get('/vendors', { params }),
  getVendorDetail: (vendorId) => api.get(`/vendors/${vendorId}`),
  addVendor: (data) => api.post('/vendors', data),
};

export const analyticsAPI = {
  getPurchasing: (params) => api.get('/analytics/purchasing', { params }),
  getSales: (params) => api.get('/analytics/sales', { params }),
  getInventory: (params) => api.get('/analytics/inventory', { params }),
  getPerformanceRanking: (params) => api.get('/analytics/vendor-performance', { params }),
  compareVendors: (vendorIds) => api.post('/analytics/vendor-comparison', { vendor_ids: vendorIds }),
  compareVendorsGet: (vendorIdsStr) => api.get('/analytics/vendor-comparison', { params: { vendor_ids: vendorIdsStr } }),
};

export const uploadAPI = {
  uploadFile: (formData) => api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPreview: (uploadId) => api.get(`/uploads/${uploadId}/preview`),
  confirmUpload: (uploadId) => api.post(`/uploads/${uploadId}/confirm`),
  getHistory: () => api.get('/uploads/history'),
};

export const reportsAPI = {
  getExportUrl: (reportType, vendorId) => {
    const token = localStorage.getItem('vpa_token');
    let url = `${API_BASE_URL}/reports/export?report_type=${reportType}&format=csv`;
    if (vendorId) url += `&vendor_id=${vendorId}`;
    if (token) url += `&token=${encodeURIComponent(token)}`;
    return url;
  },
  downloadReport: (reportType, vendorId) => api.get('/reports/export', {
    params: { report_type: reportType, vendor_id: vendorId, format: 'csv' },
    responseType: 'blob',
  }),
};

export default api;
