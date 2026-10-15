import type { UserProfile } from './user-account.js';

export interface UserProfileRepository {
  findByUserId(userId: string): UserProfile | undefined;
  save(profile: UserProfile): void;
}

export class InMemoryUserProfileRepository implements UserProfileRepository {
  private readonly profiles = new Map<string, UserProfile>();

  findByUserId(userId: string): UserProfile | undefined {
    const profile = this.profiles.get(userId);
    return profile ? { ...profile } : undefined;
  }

  save(profile: UserProfile): void {
    this.profiles.set(profile.userId, { ...profile });
  }
}
