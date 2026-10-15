import { describe, expect, it } from 'vitest';
import { InMemoryUserRepository } from '../../src/user-registration/in-memory-user-repository.js';
import { UserRegistrationService } from '../../src/user-registration/register-user.js';

describe('UserRegistrationService', () => {
  it('registers a valid user and stores a salted password hash', () => {
    const repository = new InMemoryUserRepository();
    const service = new UserRegistrationService(repository);

    const result = service.register(' Player@Example.com ', 'correct-horse');

    expect(result).toMatchObject({
      success: true,
      user: { email: 'player@example.com' },
    });
    if (!result.success) throw new Error('Expected registration to succeed');

    const storedUser = repository.findByEmail(result.user.email);
    expect(storedUser).toBeDefined();
    expect(storedUser?.passwordHash).not.toBe('correct-horse');
    expect(storedUser?.passwordSalt).toBeTruthy();
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it.each([
    ['', 'valid-password', 'invalid_email'],
    ['not-an-email', 'valid-password', 'invalid_email'],
    ['player@example.com', 'short', 'invalid_password'],
  ] as const)('rejects invalid input (%s)', (email, password, error) => {
    const service = new UserRegistrationService(new InMemoryUserRepository());

    expect(service.register(email, password)).toEqual({ success: false, error });
  });

  it('rejects an email that is already registered, ignoring case and surrounding spaces', () => {
    const service = new UserRegistrationService(new InMemoryUserRepository());
    service.register('player@example.com', 'valid-password');

    expect(service.register(' Player@Example.com ', 'another-password')).toEqual({
      success: false,
      error: 'email_already_registered',
    });
  });
});