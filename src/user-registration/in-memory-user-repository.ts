import type { UserAccount } from '../user-management/user-account.js';

export type StoredUser = UserAccount;

export interface UserRepository {
  findByEmail(email: string): StoredUser | undefined;
  save(user: StoredUser): void;
}

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, StoredUser>();

  findByEmail(email: string): StoredUser | undefined {
    return this.users.get(email);
  }

  save(user: StoredUser): void {
    this.users.set(user.email, user);
  }
}