import { describe, expect, it } from 'vitest';
import type { SportsEvent } from '../../src/sports-events/sports-event-form.js';
import { BrowseSportsEventsService } from '../../src/sports-events/browse-sports-events.js';
import { InMemorySportsEventRepository } from '../../src/sports-events/sports-event-repository.js';

const fixedNow = new Date('2026-10-15T12:00:00.000Z');

function createEvent(overrides: Partial<SportsEvent> = {}): SportsEvent {
  return {
    id: 'event-1',
    sport: 'Basketball',
    location: 'North Court',
    startAt: '2026-10-16T18:30:00.000Z',
    capacity: 10,
    organizerId: 'organizer-1',
    participants: ['user-1'],
    availablePlaces: 9,
    ...overrides,
  };
}

function createService(events: SportsEvent[]) {
  const repository = new InMemorySportsEventRepository();
  for (const event of events) repository.save(event);
  return new BrowseSportsEventsService(repository, () => fixedNow);
}

describe('BrowseSportsEventsService', () => {
  it('lists upcoming events chronologically with their date, time, and capacity details', () => {
    const service = createService([
      createEvent({ id: 'later', startAt: '2026-10-18T09:15:00.000Z' }),
      createEvent({ id: 'past', startAt: '2026-10-15T11:59:59.000Z' }),
      createEvent({ id: 'earlier', startAt: '2026-10-16T18:30:00.000Z' }),
      createEvent({ id: 'starting-now', startAt: fixedNow.toISOString() }),
    ]);

    expect(service.list()).toEqual([
      expect.objectContaining({
        id: 'earlier',
        sport: 'Basketball',
        date: '2026-10-16',
        time: '18:30',
        location: 'North Court',
        capacity: 10,
        availablePlaces: 9,
      }),
      expect.objectContaining({
        id: 'later',
        date: '2026-10-18',
        time: '09:15',
      }),
    ]);
  });

  it('filters by sport and location without case sensitivity and trims filter values', () => {
    const service = createService([
      createEvent({ id: 'match', sport: 'Basketball', location: 'North Court' }),
      createEvent({ id: 'different-sport', sport: 'Tennis', location: 'North Court' }),
      createEvent({ id: 'different-location', sport: 'Basketball', location: 'South Court' }),
    ]);

    expect(service.list({ sport: ' basketball ', location: 'NORTH COURT' }).map((event) => event.id))
      .toEqual(['match']);
  });

  it('applies sport and location filters independently', () => {
    const service = createService([
      createEvent({ id: 'basketball', sport: 'Basketball', location: 'North Court' }),
      createEvent({ id: 'tennis', sport: 'Tennis', location: 'North Court' }),
      createEvent({ id: 'other-location', sport: 'Basketball', location: 'South Court' }),
    ]);

    expect(service.list({ sport: 'Basketball' }).map((event) => event.id))
      .toEqual(['basketball', 'other-location']);
    expect(service.list({ location: 'North Court' }).map((event) => event.id))
      .toEqual(['basketball', 'tennis']);
  });

  it('treats blank filters as absent and returns an empty list when nothing matches', () => {
    const service = createService([createEvent()]);

    expect(service.list({ sport: '  ' })).toHaveLength(1);
    expect(service.list({ sport: 'Tennis' })).toEqual([]);
  });
});
