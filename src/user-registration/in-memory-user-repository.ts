import type { UserAccount } from '../user-management/user-account.js';

export type StoredUser = UserAccount;

export interface UserRepository {
  findById(id: string): StoredUser | undefined;
  findByEmail(email: string): StoredUser | undefined;
  save(user: StoredUser): void;
}

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, StoredUser>();

  findById(id: string): StoredUser | undefined {
    return [...this.users.values()].find((user) => user.id === id);
  }

  findByEmail(email: string): StoredUser | undefined {
    return this.users.get(email);
  }

  save(user: StoredUser): void {
    this.users.set(user.email, user);
  }
}