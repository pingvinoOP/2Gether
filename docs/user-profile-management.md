# User Profile Management

`ManageUserProfileService` creates, retrieves, and updates a profile for an existing user account. Each profile contains a required display name and an optional profile-picture URL, with creation and update timestamps. A user may have only one profile.

## Behavior

- Creating or reading a profile requires an existing user account.
- Display names are trimmed and cannot be blank.
- Profile-picture URLs are optional; when provided, they must be valid HTTPS URLs. Passing `null` or a blank value when creating or updating removes the picture.
- Updates are partial: omitted fields stay unchanged. Empty updates and invalid values return typed errors without changing stored data.
- Profile reads and writes return copies so callers cannot mutate repository data without saving it.

The service and in-memory repository are in `src/user-management/`. The account lookup uses the existing user repository. The in-memory implementation is suitable for tests and local use; production persistence must use the `user_profiles` table described in [Database Configuration](./database-configuration.md).

Run `npm test` for unit and schema tests and `npm run typecheck` for TypeScript validation.
