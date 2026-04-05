export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithRoles extends User {
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  is_active?: boolean;
}

export interface RoleCreate {
  name: string;
  description?: string;
}

export interface RoleUpdate {
  name?: string;
  description?: string;
}

export interface PermissionCreate {
  name: string;
  description?: string;
}

export interface PermissionUpdate {
  name?: string;
  description?: string;
}

export interface InitResponse {
  message: string;
  admin_username?: string;
  admin_password?: string;
  admin_exists?: boolean;
}