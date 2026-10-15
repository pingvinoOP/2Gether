import type { UserProfile } from './user-account.js';
import type { UserProfileRepository } from './user-profile-repository.js';
import type { UserRepository } from '../user-registration/in-memory-user-repository.js';

export interface CreateUserProfileInput {
  displayName?: string;
  profilePictureUrl?: string | null;
}

export interface UpdateUserProfileInput {
  displayName?: string;
  profilePictureUrl?: string | null;
}

export type UserProfileError =
  | 'user_not_found'
  | 'profile_not_found'
  | 'profile_already_exists'
  | 'invalid_user_id'
  | 'invalid_display_name'
  | 'invalid_profile_picture_url'
  | 'empty_update';

export type UserProfileResult =
  | { success: true; profile: UserProfile }
  | { success: false; error: UserProfileError };

function normalizeDisplayName(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function normalizeProfilePictureUrl(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const normalized = value?.trim();
  return normalized || null;
}

function isValidProfilePictureUrl(value: string | null): boolean {
  if (value === null) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.length > 0
      && !url.username && !url.password;
  } catch {
    return false;
  }
}

export class ManageUserProfileService {
  constructor(
    private readonly users: Pick<UserRepository, 'findById'>,
    private readonly profiles: UserProfileRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  get(userId: string): UserProfileResult {
    if (!userId.trim()) return { success: false, error: 'invalid_user_id' };
    if (!this.users.findById(userId)) return { success: false, error: 'user_not_found' };

    const profile = this.profiles.findByUserId(userId);
    return profile
      ? { success: true, profile }
      : { success: false, error: 'profile_not_found' };
  }

  create(userId: string, input: CreateUserProfileInput): UserProfileResult {
    if (!userId.trim()) return { success: false, error: 'invalid_user_id' };
    if (!this.users.findById(userId)) return { success: false, error: 'user_not_found' };
    if (this.profiles.findByUserId(userId)) {
      return { success: false, error: 'profile_already_exists' };
    }

    const displayName = normalizeDisplayName(input.displayName);
    if (!displayName) return { success: false, error: 'invalid_display_name' };

    const profilePictureUrl = normalizeProfilePictureUrl(input.profilePictureUrl) ?? null;
    if (!isValidProfilePictureUrl(profilePictureUrl)) {
      return { success: false, error: 'invalid_profile_picture_url' };
    }

    const now = this.now().toISOString();
    const profile: UserProfile = {
      userId,
      displayName,
      profilePictureUrl,
      createdAt: now,
      updatedAt: now,
    };
    this.profiles.save(profile);
    return { success: true, profile };
  }

  update(userId: string, input: UpdateUserProfileInput): UserProfileResult {
    if (!userId.trim()) return { success: false, error: 'invalid_user_id' };
    if (!this.users.findById(userId)) return { success: false, error: 'user_not_found' };

    const current = this.profiles.findByUserId(userId);
    if (!current) return { success: false, error: 'profile_not_found' };
    if (input.displayName === undefined && input.profilePictureUrl === undefined) {
      return { success: false, error: 'empty_update' };
    }

    const displayName = input.displayName === undefined
      ? current.displayName
      : normalizeDisplayName(input.displayName);
    if (!displayName) return { success: false, error: 'invalid_display_name' };

    const profilePictureUrl = input.profilePictureUrl === undefined
      ? current.profilePictureUrl
      : normalizeProfilePictureUrl(input.profilePictureUrl) ?? null;
    if (!isValidProfilePictureUrl(profilePictureUrl)) {
      return { success: false, error: 'invalid_profile_picture_url' };
    }

    const profile: UserProfile = {
      ...current,
      displayName,
      profilePictureUrl,
      updatedAt: this.now().toISOString(),
    };
    this.profiles.save(profile);
    return { success: true, profile };
  }
}
