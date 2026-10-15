# Browse Sports Events

`BrowseSportsEventsService` lists future sports events from the sports-event repository. Results are sorted by start time and exclude events starting at or before the current instant.

## Listing and filters

The service accepts optional `sport` and `location` filters. Each filter is trimmed and compared case-insensitively against the event's full sport or location value. Supplying both filters requires an event to match both; blank filters are ignored.

Listings retain the sports-event model fields, including `capacity` and `availablePlaces`, and expose the event start as UTC `date` (`YYYY-MM-DD`) and `time` (`HH:mm`) values derived from `startAt`.

The service is in `src/sports-events/browse-sports-events.ts`. Run `npm test` for the unit tests and `npm run typecheck` for TypeScript validation.
