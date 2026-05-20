import { BaseService } from './base.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

class UsersService extends BaseService {
  constructor() {
    super('/users');
  }

  // Add user-specific methods here
  async getCurrentUser() {
    const { data } = await this.api.get<User>('/users/me');
    return data;
  }
}

export const usersService = new UsersService(); 