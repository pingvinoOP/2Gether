import { randomBytes, scryptSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { InMemorySessionStore } from '../../src/user-login/in-memory-session-store.js';
import { UserLoginService, type LoginCredential } from '../../src/user-login/user-login-service.js';

const registeredUser: LoginCredential = (() => {
  const passwordSalt = randomBytes(16).toString('hex');
  return {
    id: 'user-1',
    email: 'player@example.com',
    passwordHash: scryptSync('correct-password', passwordSalt, 64).toString('hex'),
    passwordSalt,
  };
})();

function createService() {
  const users = {
    findByEmail: (email: string) => email === registeredUser.email ? registeredUser : undefined,
  };
  const sessions = new InMemorySessionStore();
  return { service: new UserLoginService(users, sessions), sessions };
}

describe('UserLoginService', () => {
  it('logs in a registered user and creates an active session', () => {
    const { service } = createService();

    const result = service.login(' Player@Example.com ', 'correct-password');

    expect(result).toMatchObject({
      success: true,
      user: { id: registeredUser.id, email: registeredUser.email },
    });
    if (!result.success) throw new Error('Expected login to succeed');
    expect(result.sessionToken).toBeTruthy();
    expect(service.getSession(result.sessionToken)).toEqual({
      token: result.sessionToken,
      userId: registeredUser.id,
    });
  });

  it.each([
    ['missing@example.com', 'correct-password'],
    ['player@example.com', 'wrong-password'],
  ])('rejects invalid credentials (%s)', (email, password) => {
    const { service, sessions } = createService();

    expect(service.login(email, password)).toEqual({
      success: false,
      error: 'invalid_credentials',
    });
    expect(sessions.findByToken('unknown-token')).toBeUndefined();
  });

  it('invalidates the session on logout', () => {
    const { service } = createService();
    const result = service.login('player@example.com', 'correct-password');
    if (!result.success) throw new Error('Expected login to succeed');

    expect(service.logout(result.sessionToken)).toBe(true);
    expect(service.getSession(result.sessionToken)).toBeUndefined();
    expect(service.logout(result.sessionToken)).toBe(false);
  });
});