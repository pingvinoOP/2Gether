import { describe, expect, it } from 'vitest';
import type { UserAccount } from '../../src/user-management/user-account.js';
import { ManageUserProfileService } from '../../src/user-management/manage-user-profile.js';
import { InMemoryUserProfileRepository } from '../../src/user-management/user-profile-repository.js';
import { InMemoryUserRepository } from '../../src/user-registration/in-memory-user-repository.js';

const fixedNow = new Date('2026-10-15T12:00:00.000Z');

function createService(now: () => Date = () => fixedNow) {
  const users = new InMemoryUserRepository();
  const user: UserAccount = {
    id: 'user-1',
    email: 'player@example.com',
    passwordHash: 'hash',
    passwordSalt: 'salt',
    createdAt: fixedNow.toISOString(),
    updatedAt: fixedNow.toISOString(),
  };
  users.save(user);

  const profiles = new InMemoryUserProfileRepository();
  const service = new ManageUserProfileService(users, profiles, now);
  return { users, profiles, service };
}

describe('ManageUserProfileService', () => {
  it('creates and retrieves a profile for an existing user', () => {
    const { service } = createService();

    const created = service.create('user-1', {
      displayName: '  Player One  ',
      profilePictureUrl: ' https://images.example/player.png ',
    });

    expect(created).toEqual({
      success: true,
      profile: {
        userId: 'user-1',
        displayName: 'Player One',
        profilePictureUrl: 'https://images.example/player.png',
        createdAt: fixedNow.toISOString(),
        updatedAt: fixedNow.toISOString(),
      },
    });
    expect(service.get('user-1')).toEqual(created);
  });

  it('allows an optional profile picture and enforces one profile per user', () => {
    const { service } = createService();

    expect(service.create('user-1', { displayName: 'Player One' })).toMatchObject({
      success: true,
      profile: { profilePictureUrl: null },
    });
    expect(service.create('user-1', { displayName: 'Another Name' })).toEqual({
      success: false,
      error: 'profile_already_exists',
    });
  });

  it('updates profile fields, preserves omitted fields and creation time, and supports clearing the picture', () => {
    let currentNow = fixedNow;
    const { service } = createService(() => currentNow);
    service.create('user-1', {
      displayName: 'Player One',
      profilePictureUrl: 'https://images.example/player.png',
    });
    currentNow = new Date('2026-10-16T12:00:00.000Z');

    const result = service.update('user-1', {
      displayName: 'Updated Player',
      profilePictureUrl: null,
    });

    expect(result).toEqual({
      success: true,
      profile: {
        userId: 'user-1',
        displayName: 'Updated Player',
        profilePictureUrl: null,
        createdAt: fixedNow.toISOString(),
        updatedAt: currentNow.toISOString(),
      },
    });
  });

  it('rejects invalid user, display name, profile URL, and empty updates without modifying data', () => {
    const { profiles, service } = createService();

    expect(service.get('  ')).toEqual({ success: false, error: 'invalid_user_id' });
    expect(service.get('missing-user')).toEqual({ success: false, error: 'user_not_found' });
    expect(service.create('missing-user', { displayName: 'Player' })).toEqual({
      success: false,
      error: 'user_not_found',
    });
    expect(service.create('user-1', { displayName: '  ' })).toEqual({
      success: false,
      error: 'invalid_display_name',
    });
    expect(service.create('user-1', {
      displayName: 'Player',
      profilePictureUrl: 'javascript:alert(1)',
    })).toEqual({ success: false, error: 'invalid_profile_picture_url' });
    expect(profiles.findByUserId('user-1')).toBeUndefined();

    service.create('user-1', { displayName: 'Player' });
    const before = profiles.findByUserId('user-1');
    expect(service.update('user-1', {})).toEqual({ success: false, error: 'empty_update' });
    expect(service.update('user-1', { displayName: '' })).toEqual({
      success: false,
      error: 'invalid_display_name',
    });
    expect(service.update('user-1', { profilePictureUrl: 'http://images.example/player.png' }))
      .toEqual({ success: false, error: 'invalid_profile_picture_url' });
    expect(profiles.findByUserId('user-1')).toEqual(before);
  });

  it('reports when a user has no profile', () => {
    const { service } = createService();

    expect(service.get('user-1')).toEqual({ success: false, error: 'profile_not_found' });
    expect(service.update('user-1', { displayName: 'Updated Player' })).toEqual({
      success: false,
      error: 'profile_not_found',
    });
  });

  it('copies profile values across repository reads and writes', () => {
    const { profiles, service } = createService();
    const created = service.create('user-1', { displayName: 'Player One' });
    if (!created.success) throw new Error('Expected profile creation to succeed');

    created.profile.displayName = 'Mutated';
    expect(profiles.findByUserId('user-1')?.displayName).toBe('Player One');
  });
});
