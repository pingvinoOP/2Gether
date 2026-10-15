import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  new URL('../../database/migrations/001_create_users_and_profiles.sql', import.meta.url),
  'utf8',
);

function createDatabase(): DatabaseSync {
  const database = new DatabaseSync(':memory:');
  database.exec('PRAGMA foreign_keys = ON');
  database.exec(migration);
  return database;
}

function insertUser(database: DatabaseSync, id = 'user-1', email = 'player@example.com'): void {
  database.prepare(`
    INSERT INTO users (id, email, password_hash, password_salt)
    VALUES (?, ?, ?, ?)
  `).run(id, email, 'scrypt-hash', 'random-salt');
}

describe('user database schema', () => {
  it('stores account and profile data with timestamps and an optional profile picture', () => {
    const database = createDatabase();
    insertUser(database);

    database.prepare(`
      INSERT INTO user_profiles (user_id, display_name)
      VALUES (?, ?)
    `).run('user-1', 'Player One');

    const account = database.prepare('SELECT * FROM users WHERE id = ?').get('user-1');
    expect(account).toMatchObject({
      id: 'user-1',
      email: 'player@example.com',
      password_hash: 'scrypt-hash',
      password_salt: 'random-salt',
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
    const profile = database.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get('user-1');
    expect(profile).toMatchObject({
      user_id: 'user-1',
      display_name: 'Player One',
      profile_picture_url: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it('enforces unique, normalized email addresses', () => {
    const database = createDatabase();
    insertUser(database);

    expect(() => insertUser(database, 'user-2')).toThrow(/UNIQUE constraint failed/);
    expect(() => insertUser(database, 'user-3', 'PLAYER@OTHER.EXAMPLE'))
      .toThrow(/CHECK constraint failed/);
  });

  it('requires valid account and profile fields', () => {
    const database = createDatabase();

    expect(() => insertUser(database, 'user-1', 'not-an-email')).toThrow(/CHECK constraint failed/);
    insertUser(database);

    expect(() => database.prepare(`
      INSERT INTO user_profiles (user_id, display_name) VALUES (?, ?)
    `).run('user-1', '  ')).toThrow(/CHECK constraint failed/);
    expect(() => database.prepare(`
      INSERT INTO user_profiles (user_id, display_name, profile_picture_url)
      VALUES (?, ?, ?)
    `).run('user-1', 'Player One', 'javascript:alert(1)'))
      .toThrow(/CHECK constraint failed/);
  });

  it('enforces the one-to-one profile relationship and cascades account deletion', () => {
    const database = createDatabase();
    insertUser(database);

    const insertProfile = database.prepare(`
      INSERT INTO user_profiles (user_id, display_name) VALUES (?, ?)
    `);
    insertProfile.run('user-1', 'Player One');
    expect(() => insertProfile.run('user-1', 'Second Profile'))
      .toThrow(/UNIQUE constraint failed/);
    expect(() => insertProfile.run('missing-user', 'Orphan Profile'))
      .toThrow(/FOREIGN KEY constraint failed/);

    database.prepare('DELETE FROM users WHERE id = ?').run('user-1');
    expect(database.prepare('SELECT * FROM user_profiles').all()).toEqual([]);
  });

  it('updates account and profile timestamps when their records change', () => {
    const database = createDatabase();
    database.prepare(`
      INSERT INTO users (id, email, password_hash, password_salt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'user-1',
      'player@example.com',
      'hash',
      'salt',
      '2000-01-01T00:00:00.000Z',
      '2000-01-01T00:00:00.000Z',
    );
    database.prepare(`
      INSERT INTO user_profiles (user_id, display_name, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run('user-1', 'Player One', '2000-01-01T00:00:00.000Z', '2000-01-01T00:00:00.000Z');

    database.prepare('UPDATE users SET email = ? WHERE id = ?').run('new@example.com', 'user-1');
    database.prepare('UPDATE user_profiles SET display_name = ? WHERE user_id = ?')
      .run('Updated Player', 'user-1');

    expect(database.prepare('SELECT updated_at FROM users WHERE id = ?').get('user-1')?.updated_at)
      .not.toBe('2000-01-01T00:00:00.000Z');
    expect(database.prepare('SELECT updated_at FROM user_profiles WHERE user_id = ?')
      .get('user-1')?.updated_at).not.toBe('2000-01-01T00:00:00.000Z');
  });
});
