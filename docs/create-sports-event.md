# Create Sports Event

The sports-event feature is split into a form contract, pure validation, a creation service, and an in-memory repository. This keeps the form model, validation rules, and persistence independently testable.

## Form fields and behavior

- Required fields: sport, location, start date, start time, capacity, and organizer ID.
- Text fields are trimmed and cannot be blank.
- Start date uses `YYYY-MM-DD`; start time uses 24-hour `HH:mm`.
- Date and time are interpreted as UTC because the form has no timezone field. Starts before the current instant are rejected.
- Capacity must be a positive safe integer.
- Invalid forms return field-level errors and are not persisted.
- Valid events receive a generated ID and are saved in memory. The repository data is lost when the process exits.

The typed form contract lives in `src/sports-events/sports-event-form.ts`; validation and persistence are separate modules in the same feature directory.

## Validation

Run `npm test` for the sports-event unit tests and `npm run typecheck` for TypeScript validation.