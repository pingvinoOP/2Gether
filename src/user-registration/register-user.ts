import { randomBytes, randomUUID, scryptSync } from 'node:crypto';
import type { StoredUser, UserRepository } from './in-memory-user-repository.js';

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegistrationError = 'invalid_email' | 'invalid_password' | 'email_already_registered';

export type RegistrationResult =
  | { success: true; user: { id: string; email: string } }
  | { success: false; error: RegistrationError };

export class UserRegistrationService {
  constructor(private readonly users: UserRepository) {}

  register(email: string, password: string): RegistrationResult {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
      return { success: false, error: 'invalid_email' };
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return { success: false, error: 'invalid_password' };
    }

    if (this.users.findByEmail(normalizedEmail)) {
      return { success: false, error: 'email_already_registered' };
    }

    const passwordSalt = randomBytes(16).toString('hex');
    const passwordHash = scryptSync(password, passwordSalt, 64).toString('hex');
    const now = new Date().toISOString();
    const user: StoredUser = {
      id: randomUUID(),
      email: normalizedEmail,
      passwordHash,
      passwordSalt,
      createdAt: now,
      updatedAt: now,
    };

    this.users.save(user);
    return { success: true, user: { id: user.id, email: user.email } };
  }
}