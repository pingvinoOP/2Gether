import { randomBytes } from 'node:crypto';

export interface UserSession {
  token: string;
  userId: string;
}

export class InMemorySessionStore {
  private readonly sessions = new Map<string, UserSession>();

  create(userId: string): UserSession {
    const session = {
      token: randomBytes(32).toString('base64url'),
      userId,
    };
    this.sessions.set(session.token, session);
    return session;
  }

  findByToken(token: string): UserSession | undefined {
    return this.sessions.get(token);
  }

  delete(token: string): boolean {
    return this.sessions.delete(token);
  }
}