# Database Configuration

## Current status

The project currently has no ORM, database driver, migration runner, or configured database connection. Registration and session data are held in memory, so they are lost when the process exits. The first database schema is provided as a standalone SQLite migration; it does not change the current runtime persistence behavior.

## User accounts and profiles

Apply `database/migrations/001_create_users_and_profiles.sql` to a SQLite database. For example, with the SQLite command-line tool:

```sh
sqlite3 2gether.db < database/migrations/001_create_users_and_profiles.sql
```

Enable `PRAGMA foreign_keys = ON` for every SQLite connection so that profile ownership and account-deletion cascades are enforced. The schema stores:

- `users`: the unique user ID, normalized unique email, password hash and salt, creation timestamp, and automatically maintained update timestamp.
- `user_profiles`: a one-to-one profile keyed by the user ID, required display name, optional HTTPS profile-picture URL, creation timestamp, and automatically maintained update timestamp. Deleting an account cascades to its profile.

The existing registration service normalizes and validates email addresses and hashes passwords with scrypt. The migration also checks normalized email format and required values; it stores only the hash and salt, never the plaintext password. Keep connection settings outside source control if a database connection is configured later.

The TypeScript account and profile contracts are in `src/user-management/user-account.ts`. The schema migration is exercised against an in-memory SQLite database by `npm test`; run `npm run typecheck` for TypeScript validation.
