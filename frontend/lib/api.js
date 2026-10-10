import axios from 'axios';
import { tokenService } from './tokenService';

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const normalizedApiUrl = API_URL.replace(/\/+$/, '');

const api = axios.create({
  baseURL: normalizedApiUrl === '' ? '/' : normalizedApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if available
api.interceptors.request.use(
    (config) => {
      const token = tokenService.getToken();
      if (token && !tokenService.isTokenExpired()) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

// Handle unauthorized/forbidden globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
      const isAuthRequest = error.config?.url?.includes('/auth/');
      
      // Handle 401 Unauthorized
      if (error.response?.status === 401 && !isAuthRequest) {
        tokenService.clearAuthData();
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          const isProtectedRoute = 
            pathname.startsWith('/customer') ||
            pathname.startsWith('/vendor') ||
            pathname.startsWith('/booking') ||
            pathname.startsWith('/dashboard');

          if (isProtectedRoute) {
            window.location.href = '/login';
          }
        }
      }
      
      // Enhance error object with better message extraction from backend
      if (error.response?.data) {
        const data = error.response.data;
        let detailsMsg = '';
        if (data.details) {
          detailsMsg = Array.isArray(data.details) ? data.details.join(', ') : String(data.details);
        }
        
        const backendMessage = detailsMsg 
          ? (data.error ? `${data.error}: ${detailsMsg}` : detailsMsg)
          : (data.error || 
             data.message || 
             (data.errors && (typeof data.errors === 'string' ? data.errors : data.errors.message || (Array.isArray(data.errors) && data.errors[0]?.message))));
        
        if (backendMessage) {
          error.extractedMessage = backendMessage;
        }
      }
      
      return Promise.reject(error);
    }
);

export const apiService = {
  // Authentication
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.delete('/auth/logout'),
  },

  // Users
  users: {
    getById: (id) => api.get(`/users/${id}`),
    update: (id, data) => api.put(`/users/${id}`, data),
    uploadAvatar: (id, file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.post(`/users/${id}/upload_avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },

  // Profiles
  profiles: {
    me: () => api.get('/profiles/me'),
    serviceCategories: () => api.get('/profiles/service_categories'),
    getById: (id) => api.get(`/profiles/${id}`),
    create: (data) => api.post('/profiles', data),
    update: (id, data) => api.put(`/profiles/${id}`, data),
    delete: (id) => api.delete(`/profiles/${id}`),
    requestVerification: () => api.post('/profiles/request_verification'),
  },

  // Analytics
  analytics: {
    dashboard: () => api.get('/analytics/dashboard'),
  },

  // Reviews
  reviews: {
    getAll: (params) => api.get('/reviews', { params }),
    getById: (id) => api.get(`/reviews/${id}`),
    create: (data) => api.post('/reviews', data),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
    getByService: (serviceId) => api.get(`/services/${serviceId}/reviews`),
    getByVendor: (vendorId) => api.get(`/vendors/${vendorId}/reviews`),
    vote: (id) => api.post(`/reviews/${id}/vote`),
    respond: (id, vendorResponse) => api.post(`/reviews/${id}/respond`, { vendor_response: vendorResponse }),
  },

  // Services
  services: {
    getAll: (params) => api.get('/services', { params }),
    getById: (id) => api.get(`/services/${id}`),
    create: (data) => api.post('/services', data),
    update: (id, data) => api.put(`/services/${id}`, data),
    delete: (id) => api.delete(`/services/${id}`),
    search: (params) => api.get('/services/search', { params }),
    images: {
      list: (serviceId) => api.get(`/services/${serviceId}/images`),
      upload: (serviceId, file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post(`/services/${serviceId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
      reorder: (serviceId, orderData) =>
          api.post(`/services/${serviceId}/images/reorder`, orderData),
      bulkUpload: (serviceId, files) => {
        const formData = new FormData();
        files.forEach((f) => formData.append('images[]', f));
        return api.post(`/services/${serviceId}/images/bulk_upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
      setPrimary: (serviceId, imageId) =>
          api.post(`/services/${serviceId}/images/${imageId}/set_primary`),
      delete: (serviceId, imageId) =>
          api.delete(`/services/${serviceId}/images/${imageId}`),
    },
  },

  // Vendors
  vendors: {
    getAll: (params) => api.get('/vendors', { params }),
    getById: (id) => api.get(`/vendors/${id}`),
    getServices: (id) => api.get(`/vendors/${id}/services`),
    getAvailability: (id, params) =>
        api.get(`/vendors/${id}/availability`, { params }),
    getPortfolio: (id, params) => api.get(`/vendors/${id}/portfolio`, { params }),
    getReviews: (id, params) => api.get(`/vendors/${id}/reviews`, { params }),
    portfolioItems: (vendorId) =>
        api.get(`/vendors/${vendorId}/portfolio_items`),
  },

  // Portfolio Items
  portfolioItems: {
    getAll: (params) => api.get('/portfolio_items', { params }),
    getById: (id) => api.get(`/portfolio_items/${id}`),
    create: (data) => {
      if (data instanceof FormData) {
        return api.post('/portfolio_items', data, {
          headers: { 'Content-Type': undefined },
        });
      }
      return api.post('/portfolio_items', data);
    },
    update: (id, data) => api.put(`/portfolio_items/${id}`, data),
    delete: (id) => api.delete(`/portfolio_items/${id}`),
    uploadImages: (id, files) => {
      let formData;
      if (files instanceof FormData) {
        formData = files;
      } else {
        formData = new FormData();
        const fileList = Array.isArray(files) ? files : Array.from(files || []);
        fileList.forEach((f) => formData.append('images[]', f));
      }
      return api.post(`/portfolio_items/${id}/upload_images`, formData, {
        headers: { 'Content-Type': undefined },
      });
    },
    removeImage: (id, imageId) =>
        api.delete(`/portfolio_items/${id}/remove_image/${imageId}`),
    duplicate: (id) => api.post(`/portfolio_items/${id}/duplicate`),
    summary: () => api.get('/portfolio_items/summary'),
    reorder: (data) => api.post('/portfolio_items/reorder', data),
    setFeatured: (data) => api.patch('/portfolio_items/set_featured', data),
  },

  // Bookings
  bookings: {
    getAll: (params) => api.get('/bookings', { params }),
    getById: (id) => api.get(`/bookings/${id}`),
    create: (data) => api.post('/bookings', data),
    update: (id, data) => api.put(`/bookings/${id}`, data),
    delete: (id) => api.delete(`/bookings/${id}`),
    respond: (id, response) => api.post(`/bookings/${id}/respond`, response),
    messages: (id) => api.get(`/bookings/${id}/messages`),
    sendMessage: (id, message) =>
        api.post(`/bookings/${id}/send_message`, message),
    checkAvailability: (data) => api.post('/bookings/check_availability', data),
    suggestAlternatives: (data) => api.post('/bookings/suggest_alternatives', data),
  },

  // Availability Slots
  availabilitySlots: {
    getAll: (params) => api.get('/availability_slots', { params }),
    create: (data) => api.post('/availability_slots', data),
    update: (id, data) => api.put('/availability_slots', id, data),
    delete: (id) => api.delete('/availability_slots', id),
    bulkCreate: (data) => api.post('/availability_slots/bulk_create', data),
    checkConflicts: (params) =>
        api.get('/availability_slots/check_conflicts', { params }),
  },

  // Customer Favorites
  favorites: {
    getAll: () => api.get('/customer_favorites'),
    add: (vendorProfileId) => api.post('/customer_favorites', { vendor_profile_id: vendorProfileId }),
    remove: (id) => api.delete(`/customer_favorites/${id}`),
    removeByVendor: (vendorProfileId) => api.delete(`/customer_favorites/by_vendor/${vendorProfileId}`),
    check: (vendorProfileId) => api.get(`/customer_favorites/check/${vendorProfileId}`),
  },

  // Customer Checklists
  checklists: {
    getAll: () => api.get('/checklist_items'),
    create: (data) => api.post('/checklist_items', { checklist_item: data }),
    update: (id, data) => api.put(`/checklist_items/${id}`, { checklist_item: data }),
    toggle: (id) => api.patch(`/checklist_items/${id}/toggle`),
    delete: (id) => api.delete(`/checklist_items/${id}`),
  },

  // Customer Profile
  customerProfile: {
    get: () => api.get('/customer_profile'),
    update: (data) => api.put('/customer_profile', { customer_profile: data }),
  },

  // In-App Notifications
  notifications: {
    getAll: () => api.get('/in_app_notifications'),
    markAsRead: (id) => api.patch(`/in_app_notifications/${id}/read`),
    markAllRead: () => api.post('/in_app_notifications/read_all'),
  },

  // GraphQL
  graphql: (query, variables = {}) => api.post('/graphql', { query, variables }),
};

export default api;
