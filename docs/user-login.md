# User Login

`UserLoginService` authenticates registered users using a repository that looks up credential records by normalized email. Its `findByEmail` contract is compatible with the user repository introduced by KAN-7.

## Behavior

- Login trims and lowercases the email before lookup.
- Incorrect passwords and unknown users return the same `invalid_credentials` result.
- Password verification uses scrypt and `timingSafeEqual`; no secret is embedded in the implementation.
- Successful login returns a cryptographically random session token. `InMemorySessionStore` maps that token to the user ID.
- `logout(token)` removes a session and reports whether one existed. Sessions are in memory and are lost when the process exits.

## Validation

Run `npm test` for the login unit tests and `npm run typecheck` for TypeScript validation.