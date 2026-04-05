import axios from 'axios';
import type {
  Token,
  LoginRequest,
  User,
  UserWithRoles,
  UserCreate,
  UserUpdate,
  Role,
  RoleWithPermissions,
  RoleCreate,
  RoleUpdate,
  Permission,
  PermissionCreate,
  PermissionUpdate,
  InitResponse,
} from '../types';

const api = axios.create({
  baseURL: '/services/user/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post<Token>('/api/v1/auth/refresh', {
            refresh_token: refreshToken,
          });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return api(error.config);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginRequest) => api.post<Token>('/auth/login', data),
  refresh: (refreshToken: string) =>
    api.post<Token>('/auth/refresh', { refresh_token: refreshToken }),
  getMe: () => api.get<UserWithRoles>('/auth/me'),
};

export const userApi = {
  create: (data: UserCreate) => api.post<User>('/users/', data),
  list: (skip = 0, limit = 100) => api.get<User[]>('/users/', { params: { skip, limit } }),
  get: (id: number) => api.get<UserWithRoles>(`/users/${id}`),
  update: (id: number, data: UserUpdate) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

export const roleApi = {
  create: (data: RoleCreate) => api.post<Role>('/roles/', data),
  list: (skip = 0, limit = 100) => api.get<Role[]>('/roles/', { params: { skip, limit } }),
  get: (id: number) => api.get<RoleWithPermissions>(`/roles/${id}`),
  update: (id: number, data: RoleUpdate) => api.put<Role>(`/roles/${id}`, data),
  delete: (id: number) => api.delete(`/roles/${id}`),
  assignPermission: (roleId: number, permissionId: number) =>
    api.post(`/roles/${roleId}/permissions/${permissionId}`),
  removePermission: (roleId: number, permissionId: number) =>
    api.delete(`/roles/${roleId}/permissions/${permissionId}`),
  assignRoleToUser: (userId: number, roleId: number) =>
    api.post(`/roles/users/${userId}/roles/${roleId}`),
  removeRoleFromUser: (userId: number, roleId: number) =>
    api.delete(`/roles/users/${userId}/roles/${roleId}`),
};

export const permissionApi = {
  create: (data: PermissionCreate) => api.post<Permission>('/permissions/', data),
  list: (skip = 0, limit = 100) =>
    api.get<Permission[]>('/permissions/', { params: { skip, limit } }),
  get: (id: number) => api.get<Permission>(`/permissions/${id}`),
  update: (id: number, data: PermissionUpdate) =>
    api.put<Permission>(`/permissions/${id}`, data),
  delete: (id: number) => api.delete(`/permissions/${id}`),
};

export const initApi = {
  createTables: () => api.post<{ message: string }>('/init/tables'),
  initData: (adminUsername?: string, adminPassword?: string) =>
    api.post<InitResponse>('/init/data', { admin_username: adminUsername, admin_password: adminPassword }),
  initAll: (adminUsername?: string, adminPassword?: string) =>
    api.post<InitResponse>('/init/all', { admin_username: adminUsername, admin_password: adminPassword }),
  dropTables: () => api.delete<{ message: string }>('/init/tables'),
};

export default api;