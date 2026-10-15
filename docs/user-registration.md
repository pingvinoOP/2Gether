# User Registration

The registration module provides an in-memory user repository and a service for creating users.

## Behavior

- Email addresses are trimmed, lowercased, and checked against a basic email format (maximum 254 characters).
- Passwords must contain at least 8 characters.
- Duplicate email addresses are rejected without regard to case or surrounding whitespace.
- Passwords are stored as scrypt hashes with a per-user random salt. The successful result contains only the user ID and normalized email.
- The in-memory repository is intended for development and demonstration; its data is lost when the process exits.

## Validation

Run `npm test` for the registration unit tests and `npm run typecheck` for TypeScript validation.