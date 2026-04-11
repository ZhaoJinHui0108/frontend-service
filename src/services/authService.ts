import api from './api'

export interface LoginRequest {
  username: string
  password: string
}

export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface User {
  id: number
  username: string
  email: string
  is_active: boolean
  created_at: string
}

export interface UserWithRoles extends User {
  roles: Role[]
}

export interface UserCreate {
  username: string
  email: string
  password: string
}

export interface UserUpdate {
  email?: string
  password?: string
  is_active?: boolean
}

export interface Role {
  id: number
  name: string
  description: string
  created_at: string
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[]
  users: User[]
}

export interface RoleCreate {
  name: string
  description?: string
}

export interface RoleUpdate {
  name?: string
  description?: string
}

export interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description: string
}

export interface PermissionCreate {
  name: string
  resource: string
  action: string
  description?: string
}

export interface PermissionUpdate {
  name?: string
  resource?: string
  action?: string
  description?: string
}

export interface InitResponse {
  message: string
  admin_username?: string
}

export const authApi = {
  login: (data: LoginRequest) => api.post<Token>('/auth/login', data),
  register: (data: { username: string; email: string; password: string }) =>
    api.post<User>('/auth/register', data),
  forgotPassword: (data: { email: string }) =>
    api.post<{ message: string }>('/auth/forgot-password', data),
  refresh: (refreshToken: string) =>
    api.post<Token>('/auth/refresh', { refresh_token: refreshToken }),
  getMe: () => api.get<UserWithRoles>('/auth/me')
}

export const userApi = {
  create: (data: UserCreate) => api.post<User>('/users/', data),
  list: (skip = 0, limit = 100) => api.get<User[]>('/users/', { params: { skip, limit } }),
  get: (id: number) => api.get<UserWithRoles>(`/users/${id}`),
  update: (id: number, data: UserUpdate) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`)
}

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
    api.delete(`/roles/users/${userId}/roles/${roleId}`)
}

export const permissionApi = {
  create: (data: PermissionCreate) => api.post<Permission>('/permissions/', data),
  list: (skip = 0, limit = 100) =>
    api.get<Permission[]>('/permissions/', { params: { skip, limit } }),
  get: (id: number) => api.get<Permission>(`/permissions/${id}`),
  update: (id: number, data: PermissionUpdate) =>
    api.put<Permission>(`/permissions/${id}`, data),
  delete: (id: number) => api.delete(`/permissions/${id}`)
}

export const initApi = {
  updateTables: () => api.post<{ message: string }>('/init/update'),
  initData: (adminUsername?: string, adminPassword?: string) =>
    api.post<InitResponse>('/init/data', { admin_username: adminUsername, admin_password: adminPassword }),
  initAll: (adminUsername?: string, adminPassword?: string) =>
    api.post<InitResponse>('/init/all', { admin_username: adminUsername, admin_password: adminPassword }),
  dropTables: () => api.delete<{ message: string }>('/init/tables')
}
