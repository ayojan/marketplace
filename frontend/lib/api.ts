import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { tokenService } from './tokenService';

// Extend Axios error to include extractedMessage
declare module 'axios' {
  export interface AxiosError {
    extractedMessage?: string;
  }
}

// Get API URL from environment variable or browser context
const getBaseApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envUrl && envUrl !== '') {
    return envUrl.replace(/\/+$/, '');
  }
  // In the browser, default to the relative /api path so requests route to the backend via reverse proxy
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return (process.env.INTERNAL_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
};

const normalizedApiUrl = getBaseApiUrl();

const api: AxiosInstance = axios.create({
  baseURL: normalizedApiUrl === '' ? '/' : normalizedApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
  (response: AxiosResponse) => response,
  (error: any) => {
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
        detailsMsg = Array.isArray(data.details)
          ? data.details.join(', ')
          : String(data.details);
      }

      const backendMessage = detailsMsg
        ? data.error
          ? `${data.error}: ${detailsMsg}`
          : detailsMsg
        : data.error ||
        data.message ||
        (data.errors &&
          (typeof data.errors === 'string'
            ? data.errors
            : data.errors.message ||
            (Array.isArray(data.errors) && data.errors[0]?.message)));

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
    login: (credentials: any): Promise<AxiosResponse<any>> =>
      api.post('/auth/login', credentials),
    register: (userData: any): Promise<AxiosResponse<any>> =>
      api.post('/auth/register', userData),
    google: (data: any): Promise<AxiosResponse<any>> =>
      api.post('/auth/google', data),
    logout: (): Promise<AxiosResponse<any>> => api.delete('/auth/logout'),
  },

  // Users
  users: {
    getById: (id: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/users/${id}`),
    update: (id: string | number, data: any): Promise<AxiosResponse<any>> =>
      api.put(`/users/${id}`, data),
    uploadAvatar: (id: string | number, file: File): Promise<AxiosResponse<any>> => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.post(`/users/${id}/upload_avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },

  // Profiles
  profiles: {
    me: (): Promise<AxiosResponse<any>> => api.get('/profiles/me'),
    serviceCategories: (): Promise<AxiosResponse<any>> =>
      api.get('/profiles/service_categories'),
    getById: (id: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/profiles/${id}`),
    create: (data: any): Promise<AxiosResponse<any>> =>
      api.post('/profiles', data),
    update: (id: string | number, data: any): Promise<AxiosResponse<any>> =>
      api.put(`/profiles/${id}`, data),
    updateMe: (data: any): Promise<AxiosResponse<any>> =>
      api.put('/profiles/me', data),
    delete: (id: string | number): Promise<AxiosResponse<any>> =>
      api.delete(`/profiles/${id}`),
    requestVerification: (): Promise<AxiosResponse<any>> =>
      api.post('/profiles/request_verification'),
  },

  // Analytics
  analytics: {
    dashboard: (): Promise<AxiosResponse<any>> =>
      api.get('/analytics/dashboard'),
  },

  // Reviews
  reviews: {
    getAll: (params?: any): Promise<AxiosResponse<any>> =>
      api.get('/reviews', { params }),
    getById: (id: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/reviews/${id}`),
    create: (data: any): Promise<AxiosResponse<any>> =>
      api.post('/reviews', data),
    update: (id: string | number, data: any): Promise<AxiosResponse<any>> =>
      api.put(`/reviews/${id}`, data),
    delete: (id: string | number): Promise<AxiosResponse<any>> =>
      api.delete(`/reviews/${id}`),
    getByService: (serviceId: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/services/${serviceId}/reviews`),
    getByVendor: (vendorId: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/vendors/${vendorId}/reviews`),
    vote: (id: string | number): Promise<AxiosResponse<any>> =>
      api.post(`/reviews/${id}/vote`),
    respond: (
      id: string | number,
      vendorResponse: string
    ): Promise<AxiosResponse<any>> =>
      api.post(`/reviews/${id}/respond`, { vendor_response: vendorResponse }),
  },

  // Services
  services: {
    getAll: (params?: any): Promise<AxiosResponse<any>> =>
      api.get('/services', { params }),
    getById: (id: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/services/${id}`),
    create: (data: any): Promise<AxiosResponse<any>> =>
      api.post('/services', data),
    update: (id: string | number, data: any): Promise<AxiosResponse<any>> =>
      api.put(`/services/${id}`, data),
    delete: (id: string | number): Promise<AxiosResponse<any>> =>
      api.delete(`/services/${id}`),
    search: (params?: any): Promise<AxiosResponse<any>> =>
      api.get('/services/search', { params }),
    images: {
      list: (serviceId: string | number): Promise<AxiosResponse<any>> =>
        api.get(`/services/${serviceId}/images`),
      upload: (
        serviceId: string | number,
        file: File,
        meta: { title?: string; is_primary?: boolean } = {}
      ): Promise<AxiosResponse<any>> => {
        const formData = new FormData();
        formData.append('service_image[image]', file);
        formData.append('image', file);
        if (meta?.title) {
          formData.append('service_image[title]', meta.title);
          formData.append('title', meta.title);
        }
        if (meta?.is_primary !== undefined) {
          formData.append('service_image[is_primary]', String(meta.is_primary));
          formData.append('is_primary', String(meta.is_primary));
        }
        return api.post(`/services/${serviceId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
      reorder: (serviceId: string | number, orderData: any): Promise<AxiosResponse<any>> =>
        api.post(`/services/${serviceId}/images/reorder`, orderData),
      bulkUpload: (
        serviceId: string | number,
        files: File[]
      ): Promise<AxiosResponse<any>> => {
        const formData = new FormData();
        files.forEach((f) => formData.append('images[]', f));
        return api.post(`/services/${serviceId}/images/bulk_upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
      setPrimary: (
        serviceId: string | number,
        imageId: string | number
      ): Promise<AxiosResponse<any>> =>
        api.post(`/services/${serviceId}/images/${imageId}/set_primary`),
      delete: (
        serviceId: string | number,
        imageId: string | number
      ): Promise<AxiosResponse<any>> =>
        api.delete(`/services/${serviceId}/images/${imageId}`),
    },
  },

  // Vendors
  vendors: {
    getAll: (params?: any): Promise<AxiosResponse<any>> =>
      api.get('/vendors', { params }),
    getById: (id: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/vendors/${id}`),
    getServices: (id: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/vendors/${id}/services`),
    getAvailability: (
      id: string | number,
      params?: any
    ): Promise<AxiosResponse<any>> =>
      api.get(`/vendors/${id}/availability`, { params }),
    getPortfolio: (
      id: string | number,
      params?: any
    ): Promise<AxiosResponse<any>> =>
      api.get(`/vendors/${id}/portfolio`, { params }),
    getReviews: (
      id: string | number,
      params?: any
    ): Promise<AxiosResponse<any>> =>
      api.get(`/vendors/${id}/reviews`, { params }),
    portfolioItems: (vendorId: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/vendors/${vendorId}/portfolio_items`),
  },

  // Portfolio Items
  portfolioItems: {
    getAll: (params?: any): Promise<AxiosResponse<any>> =>
      api.get('/portfolio_items', { params }),
    getById: (id: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/portfolio_items/${id}`),
    create: (data: any): Promise<AxiosResponse<any>> => {
      if (data instanceof FormData) {
        return api.post('/portfolio_items', data, {
          headers: { 'Content-Type': undefined },
        });
      }
      return api.post('/portfolio_items', data);
    },
    update: (id: string | number, data: any): Promise<AxiosResponse<any>> =>
      api.put(`/portfolio_items/${id}`, data),
    delete: (id: string | number): Promise<AxiosResponse<any>> =>
      api.delete(`/portfolio_items/${id}`),
    uploadImages: (
      id: string | number,
      files: File[] | FileList | FormData
    ): Promise<AxiosResponse<any>> => {
      let formData: FormData;
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
    removeImage: (
      id: string | number,
      imageId: string | number
    ): Promise<AxiosResponse<any>> =>
      api.delete(`/portfolio_items/${id}/remove_image/${imageId}`),
    duplicate: (id: string | number): Promise<AxiosResponse<any>> =>
      api.post(`/portfolio_items/${id}/duplicate`),
    summary: (): Promise<AxiosResponse<any>> =>
      api.get('/portfolio_items/summary'),
    reorder: (data: any): Promise<AxiosResponse<any>> =>
      api.post('/portfolio_items/reorder', data),
    setFeatured: (data: any): Promise<AxiosResponse<any>> =>
      api.patch('/portfolio_items/set_featured', data),
  },

  // Bookings
  bookings: {
    getAll: (params?: any): Promise<AxiosResponse<any>> =>
      api.get('/bookings', { params }),
    getById: (id: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/bookings/${id}`),
    create: (data: any): Promise<AxiosResponse<any>> =>
      api.post('/bookings', data),
    update: (id: string | number, data: any): Promise<AxiosResponse<any>> =>
      api.put(`/bookings/${id}`, data),
    delete: (id: string | number): Promise<AxiosResponse<any>> =>
      api.delete(`/bookings/${id}`),
    respond: (id: string | number, response: any): Promise<AxiosResponse<any>> =>
      api.post(`/bookings/${id}/respond`, response),
    messages: (id: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/bookings/${id}/messages`),
    sendMessage: (
      id: string | number,
      message: any
    ): Promise<AxiosResponse<any>> =>
      api.post(`/bookings/${id}/send_message`, message),
    checkAvailability: (data: any): Promise<AxiosResponse<any>> =>
      api.post('/bookings/check_availability', data),
    suggestAlternatives: (data: any): Promise<AxiosResponse<any>> =>
      api.post('/bookings/suggest_alternatives', data),
  },

  // Availability Slots
  availabilitySlots: {
    getAll: (params?: any): Promise<AxiosResponse<any>> =>
      api.get('/availability_slots', { params }),
    create: (data: any): Promise<AxiosResponse<any>> =>
      api.post('/availability_slots', data),
    update: (id: string | number, data: any): Promise<AxiosResponse<any>> =>
      api.put(`/availability_slots/${id}`, data),
    delete: (id: string | number): Promise<AxiosResponse<any>> =>
      api.delete(`/availability_slots/${id}`),
    bulkCreate: (data: any): Promise<AxiosResponse<any>> =>
      api.post('/availability_slots/bulk_create', data),
    checkConflicts: (params?: any): Promise<AxiosResponse<any>> =>
      api.get('/availability_slots/check_conflicts', { params }),
  },

  // Customer Favorites
  favorites: {
    getAll: (): Promise<AxiosResponse<any>> => api.get('/customer_favorites'),
    add: (vendorId: string | number): Promise<AxiosResponse<any>> =>
      api.post('/customer_favorites', { vendor_id: vendorId }),
    remove: (id: string | number): Promise<AxiosResponse<any>> =>
      api.delete(`/customer_favorites/${id}`),
    removeByVendor: (vendorId: string | number): Promise<AxiosResponse<any>> =>
      api.delete(`/customer_favorites/by_vendor/${vendorId}`),
    check: (vendorId: string | number): Promise<AxiosResponse<any>> =>
      api.get(`/customer_favorites/check/${vendorId}`),
  },

  // Customer Checklists
  checklists: {
    getAll: (): Promise<AxiosResponse<any>> => api.get('/checklist_items'),
    create: (data: any): Promise<AxiosResponse<any>> =>
      api.post('/checklist_items', { checklist_item: data }),
    update: (id: string | number, data: any): Promise<AxiosResponse<any>> =>
      api.put(`/checklist_items/${id}`, { checklist_item: data }),
    toggle: (id: string | number): Promise<AxiosResponse<any>> =>
      api.patch(`/checklist_items/${id}/toggle`),
    delete: (id: string | number): Promise<AxiosResponse<any>> =>
      api.delete(`/checklist_items/${id}`),
  },

  // Customer Profile / Customer
  customer: {
    get: (): Promise<AxiosResponse<any>> => api.get('/customer'),
    update: (data: any): Promise<AxiosResponse<any>> =>
      api.put('/customer', { customer: data }),
  },

  // In-App Notifications
  notifications: {
    getAll: (): Promise<AxiosResponse<any>> => api.get('/in_app_notifications'),
    markAsRead: (id: string | number): Promise<AxiosResponse<any>> =>
      api.patch(`/in_app_notifications/${id}/read`),
    markAllRead: (): Promise<AxiosResponse<any>> =>
      api.post('/in_app_notifications/read_all'),
  },
};

export default api;
