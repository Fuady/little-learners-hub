/**
 * Centralized API Service
 * All backend calls use the FastAPI backend
 */

import apiClient from '../lib/apiClient';
import { tokenStorage } from '../lib/tokenStorage';

// Types (matching OpenAPI spec with camelCase)
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'parent' | 'educator';
  avatar?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'worksheet' | 'activity_book' | 'drawing' | 'puzzle' | 'game';
  gradeLevel: 'kindergarten' | 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'grade5';
  thumbnail: string;
  downloadUrl?: string;
  isInteractive: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  downloads: number;
  likes: number;
  tags: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'parent' | 'educator';
}

export interface SubmitMaterialRequest {
  title: string;
  description: string;
  type: Material['type'];
  gradeLevel: Material['gradeLevel'];
  file?: File;
  isInteractive: boolean;
  tags: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MaterialsListResponse {
  items: Material[];
  total: number;
}

export interface StatsResponse {
  totalMaterials: number;
  totalDownloads: number;
  totalUsers: number;
  gradeBreakdown: Record<string, number>;
}

/**
 * Transform backend response (snake_case) to frontend format (camelCase)
 */
function transformMaterial(backendMaterial: any): Material {
  return {
    id: backendMaterial.id,
    title: backendMaterial.title,
    description: backendMaterial.description,
    type: backendMaterial.type,
    gradeLevel: backendMaterial.grade_level,
    thumbnail: backendMaterial.thumbnail,
    downloadUrl: backendMaterial.download_url,
    isInteractive: backendMaterial.is_interactive,
    authorId: backendMaterial.author_id,
    authorName: backendMaterial.author_name,
    createdAt: backendMaterial.created_at,
    downloads: backendMaterial.downloads,
    likes: backendMaterial.likes,
    tags: backendMaterial.tags,
  };
}

function transformUser(backendUser: any): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    role: backendUser.role,
    avatar: backendUser.avatar,
    createdAt: backendUser.created_at,
  };
}

/**
 * Transform frontend request (camelCase) to backend format (snake_case)
 */
function transformMaterialRequest(request: SubmitMaterialRequest): any {
  return {
    title: request.title,
    description: request.description,
    type: request.type,
    grade_level: request.gradeLevel,
    is_interactive: request.isInteractive,
    tags: request.tags,
  };
}

// =============================================================================
// Authentication API
// =============================================================================

export async function login(email: string, password: string): Promise<User> {
  const response = await apiClient.post('/auth/login', { email, password });
  const { user, access_token } = response.data;

  // Store token
  tokenStorage.setToken(access_token);

  return transformUser(user);
}

export async function register(data: RegisterRequest): Promise<User> {
  const response = await apiClient.post('/auth/register', data);
  const { user, access_token } = response.data;

  // Store token
  tokenStorage.setToken(access_token);

  return transformUser(user);
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    // Always remove token, even if request fails
    tokenStorage.removeToken();
  }
}

// =============================================================================
// User API
// =============================================================================

export async function getCurrentUser(): Promise<User | null> {
  if (!tokenStorage.isAuthenticated()) {
    return null;
  }

  try {
    const response = await apiClient.get('/users/me');
    return transformUser(response.data);
  } catch (error) {
    // If unauthorized, token is invalid
    tokenStorage.removeToken();
    return null;
  }
}

// =============================================================================
// Materials API
// =============================================================================

export interface GetMaterialsFilters {
  type?: Material['type'];
  gradeLevel?: Material['gradeLevel'];
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getMaterials(
  filters: GetMaterialsFilters = {}
): Promise<MaterialsListResponse> {
  const params: any = {};

  if (filters.type) params.type = filters.type;
  if (filters.gradeLevel) params.gradeLevel = filters.gradeLevel;
  if (filters.search) params.search = filters.search;
  if (filters.limit) params.limit = filters.limit;
  if (filters.offset) params.offset = filters.offset;

  const response = await apiClient.get('/materials', { params });

  return {
    items: response.data.items.map(transformMaterial),
    total: response.data.total,
  };
}

export async function getMaterialById(id: string): Promise<Material> {
  const response = await apiClient.get(`/materials/${id}`);
  return transformMaterial(response.data);
}

export async function submitMaterial(data: SubmitMaterialRequest): Promise<Material> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('type', data.type);
  formData.append('grade_level', data.gradeLevel);
  formData.append('is_interactive', String(data.isInteractive));
  formData.append('tags', JSON.stringify(data.tags));

  if (data.file) {
    formData.append('file', data.file);
  }

  const response = await apiClient.post('/materials', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return transformMaterial(response.data);
}

export async function downloadMaterial(id: string): Promise<string> {
  const response = await apiClient.post(`/materials/${id}/download`);
  return response.data.url;
}

export async function likeMaterial(id: string): Promise<number> {
  const response = await apiClient.post(`/materials/${id}/like`);
  return response.data.likes;
}

// =============================================================================
// Stats API
// =============================================================================

export async function getStats(): Promise<StatsResponse> {
  const response = await apiClient.get('/stats');
  const data = response.data;

  return {
    totalMaterials: data.total_materials,
    totalDownloads: data.total_downloads,
    totalUsers: data.total_users,
    gradeBreakdown: data.grade_breakdown,
  };
}
