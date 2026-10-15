import { describe, expect, it } from 'vitest';
import type { SportsEvent } from '../../src/sports-events/sports-event-form.js';
import { ManageSportsEventParticipationService } from '../../src/sports-events/manage-sports-event-participation.js';
import { InMemorySportsEventRepository } from '../../src/sports-events/sports-event-repository.js';

const fixedNow = new Date('2026-10-15T12:00:00.000Z');

function createEvent(overrides: Partial<SportsEvent> = {}): SportsEvent {
  return {
    id: 'event-1',
    sport: 'Basketball',
    location: 'North Court',
    startAt: '2026-10-16T18:30:00.000Z',
    capacity: 2,
    organizerId: 'organizer-1',
    participants: [],
    availablePlaces: 2,
    ...overrides,
  };
}

function createService(event = createEvent(), now = fixedNow) {
  const repository = new InMemorySportsEventRepository();
  repository.save(event);
  const service = new ManageSportsEventParticipationService(repository, () => now);
  return { repository, service };
}

describe('ManageSportsEventParticipationService', () => {
  it('joins an event and decreases available places', () => {
    const { repository, service } = createService();

    const result = service.join('event-1', 'user-1');

    expect(result).toEqual({
      success: true,
      event: expect.objectContaining({
        participants: ['user-1'],
        availablePlaces: 1,
      }),
    });
    expect(repository.findById('event-1')?.availablePlaces).toBe(1);
  });

  it('does not allow the same user to join twice', () => {
    const { repository, service } = createService();
    service.join('event-1', 'user-1');

    const result = service.join('event-1', 'user-1');

    expect(result).toEqual({ success: false, error: 'already_joined' });
    expect(repository.findById('event-1')).toMatchObject({
      participants: ['user-1'],
      availablePlaces: 1,
    });
  });

  it('does not exceed event capacity', () => {
    const { repository, service } = createService();
    service.join('event-1', 'user-1');
    service.join('event-1', 'user-2');

    const result = service.join('event-1', 'user-3');

    expect(result).toEqual({ success: false, error: 'event_full' });
    expect(repository.findById('event-1')).toMatchObject({
      participants: ['user-1', 'user-2'],
      availablePlaces: 0,
    });
  });

  it('allows a participant to leave before the event starts and restores a place', () => {
    const { repository, service } = createService(
      createEvent({ participants: ['user-1'], availablePlaces: 1 }),
    );

    const result = service.leave('event-1', 'user-1');

    expect(result).toEqual({
      success: true,
      event: expect.objectContaining({
        participants: [],
        availablePlaces: 2,
      }),
    });
    expect(repository.findById('event-1')?.availablePlaces).toBe(2);
  });

  it('does not allow a participant to leave once the event has started', () => {
    const event = createEvent({
      startAt: '2026-10-15T12:00:00.000Z',
      participants: ['user-1'],
      availablePlaces: 1,
    });
    const { repository, service } = createService(event);

    const result = service.leave('event-1', 'user-1');

    expect(result).toEqual({ success: false, error: 'event_started' });
    expect(repository.findById('event-1')).toMatchObject({
      participants: ['user-1'],
      availablePlaces: 1,
    });
  });

  it('reports missing events and participants without changing repository state', () => {
    const { repository, service } = createService();

    expect(service.join('missing', 'user-1')).toEqual({
      success: false,
      error: 'event_not_found',
    });
    expect(service.join('event-1', '  ')).toEqual({
      success: false,
      error: 'invalid_participant',
    });
    expect(service.leave('event-1', 'user-1')).toEqual({
      success: false,
      error: 'not_joined',
    });
    expect(repository.findById('event-1')).toMatchObject({
      participants: [],
      availablePlaces: 2,
    });
  });
});
