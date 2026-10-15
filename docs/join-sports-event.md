# Join and Leave Sports Events

`ManageSportsEventParticipationService` manages event participants through the sports-event repository.

- Joining an event with a free place records the participant and decreases `availablePlaces`.
- A participant cannot join an event twice, and a full event rejects additional participants.
- A participant can leave only before the event start time. Leaving removes the participant and restores `availablePlaces`.
- Failed operations return a typed error and do not change the event.
- Events start with no participants and all capacity places available. The in-memory repository copies participant lists to keep stored state isolated.

The service is in `src/sports-events/manage-sports-event-participation.ts`. Run `npm test` for the unit tests and `npm run typecheck` for TypeScript validation.
