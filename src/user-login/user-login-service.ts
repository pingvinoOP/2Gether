import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { InMemorySessionStore, type UserSession } from './in-memory-session-store.js';
import type { UserAccount } from '../user-management/user-account.js';

export type LoginCredential = Pick<UserAccount, 'id' | 'email' | 'passwordHash' | 'passwordSalt'>;

export interface LoginUserRepository {
  findByEmail(email: string): LoginCredential | undefined;
}

export type LoginResult =
  | { success: true; sessionToken: string; user: { id: string; email: string } }
  | { success: false; error: 'invalid_credentials' };

export class UserLoginService {
  private readonly dummyPasswordSalt: string;
  private readonly dummyPasswordHash: string;

  constructor(
    private readonly users: LoginUserRepository,
    private readonly sessions: InMemorySessionStore,
  ) {
    this.dummyPasswordSalt = randomBytes(16).toString('hex');
    this.dummyPasswordHash = scryptSync(randomBytes(32), this.dummyPasswordSalt, 64).toString('hex');
  }

  login(email: string, password: string): LoginResult {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.findByEmail(normalizedEmail);
    const passwordSalt = user?.passwordSalt ?? this.dummyPasswordSalt;
    const passwordHash = user?.passwordHash ?? this.dummyPasswordHash;
    const candidateHash = scryptSync(password, passwordSalt, 64);
    const expectedHash = Buffer.from(passwordHash, 'hex');
    const passwordMatches = expectedHash.length === candidateHash.length
      && timingSafeEqual(candidateHash, expectedHash);

    if (!user || !passwordMatches) {
      return { success: false, error: 'invalid_credentials' };
    }

    const session = this.sessions.create(user.id);
    return {
      success: true,
      sessionToken: session.token,
      user: { id: user.id, email: user.email },
    };
  }

  getSession(token: string): UserSession | undefined {
    return this.sessions.findByToken(token);
  }

  logout(token: string): boolean {
    return this.sessions.delete(token);
  }
}