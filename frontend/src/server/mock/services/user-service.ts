// ============================================================================
// Mock 사용자 관리 서비스
// ============================================================================

import type {
  ApiResponse,
  CreateUserRequest,
  PaginatedRequest,
  PaginatedResponse,
  UpdateUserRequest,
  UserListItem,
} from '@/types/api';
import type { User } from '@/types/domain';
import { mockUsers } from '../data/users';
import { delay, wrapPaginated, wrapResponse } from './helpers';

let users: User[] = [...mockUsers];

function toListItem(user: User): UserListItem {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    department: user.department,
    phone: user.phone,
    createdAt: user.createdAt.toISOString(),
  };
}

export const mockUserService = {
  async getAll(
    filter: PaginatedRequest & { role?: string; search?: string } = {}
  ): Promise<PaginatedResponse<UserListItem>> {
    await delay();
    let filtered = [...users];

    if (filter.role) {
      filtered = filtered.filter((u) => u.role === filter.role);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name && u.name.toLowerCase().includes(q))
      );
    }

    const sortOrder = filter.order ?? 'desc';
    filtered.sort((a, b) =>
      sortOrder === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    );

    const items = filtered.map(toListItem);
    return wrapPaginated(items, filter.limit ?? 20, filter.cursor);
  },

  async getById(id: string): Promise<ApiResponse<UserListItem> | null> {
    await delay();
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    return wrapResponse(toListItem(user));
  },

  async create(req: CreateUserRequest): Promise<ApiResponse<UserListItem>> {
    await delay();
    const now = new Date();
    const newUser: User = {
      id: `user-${String(users.length + 1).padStart(3, '0')}`,
      name: req.name,
      email: req.email,
      emailVerified: null,
      passwordHash: `$2b$12$mock-hash-${Date.now()}`,
      image: null,
      role: req.role,
      isActive: true,
      lastLoginAt: null,
      department: null,
      phone: null,
      createdAt: now,
      updatedAt: now,
    };
    users.push(newUser);
    return wrapResponse(toListItem(newUser));
  },

  async update(
    id: string,
    req: UpdateUserRequest
  ): Promise<ApiResponse<UserListItem> | null> {
    await delay();
    const idx = users.findIndex((u) => u.id === id);
    if (idx < 0) return null;

    const user = users[idx];
    if (req.name !== undefined) user.name = req.name;
    if (req.role !== undefined) user.role = req.role;
    if (req.isActive !== undefined) user.isActive = req.isActive;
    user.updatedAt = new Date();

    users[idx] = user;
    return wrapResponse(toListItem(user));
  },

  async toggleActive(id: string): Promise<ApiResponse<UserListItem> | null> {
    await delay();
    const idx = users.findIndex((u) => u.id === id);
    if (idx < 0) return null;

    users[idx].isActive = !users[idx].isActive;
    users[idx].updatedAt = new Date();
    return wrapResponse(toListItem(users[idx]));
  },

  _reset() {
    users = [...mockUsers];
  },
};
