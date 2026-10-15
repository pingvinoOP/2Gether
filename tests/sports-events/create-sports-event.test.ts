import { describe, expect, it } from 'vitest';
import { CreateSportsEventService } from '../../src/sports-events/create-sports-event.js';
import { InMemorySportsEventRepository } from '../../src/sports-events/sports-event-repository.js';
import type { CreateSportsEventForm } from '../../src/sports-events/sports-event-form.js';

const fixedNow = new Date('2026-10-15T12:00:00.000Z');

const validForm: CreateSportsEventForm = {
  sport: 'Basketball',
  location: 'North Court',
  startDate: '2026-10-16',
  startTime: '18:30',
  capacity: 10,
  organizerId: 'user-1',
};

function createService() {
  const repository = new InMemorySportsEventRepository();
  const service = new CreateSportsEventService(repository, () => fixedNow);
  return { repository, service };
}

describe('CreateSportsEventService', () => {
  it('creates and persists a valid event from the form data', () => {
    const { repository, service } = createService();

    const result = service.create({ ...validForm, sport: ' Basketball ', location: ' North Court ' });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('Expected event creation to succeed');
    expect(result.event).toMatchObject({
      sport: 'Basketball',
      location: 'North Court',
      startAt: '2026-10-16T18:30:00.000Z',
      capacity: 10,
      organizerId: 'user-1',
      participants: [],
      availablePlaces: 10,
    });
    expect(repository.findById(result.event.id)).toEqual(result.event);
  });

  it('reports all missing required fields and does not persist an event', () => {
    const { repository, service } = createService();

    const result = service.create({});

    expect(result).toEqual({
      success: false,
      errors: [
        { field: 'sport', code: 'required' },
        { field: 'location', code: 'required' },
        { field: 'organizerId', code: 'required' },
        { field: 'startDate', code: 'required' },
        { field: 'startTime', code: 'required' },
        { field: 'capacity', code: 'required' },
      ],
    });
    expect(repository.list()).toHaveLength(0);
  });

  it('rejects a start date and time in the past', () => {
    const { repository, service } = createService();

    const result = service.create({ ...validForm, startDate: '2026-10-15', startTime: '11:59' });

    expect(result).toEqual({
      success: false,
      errors: [{ field: 'startDate', code: 'past' }],
    });
    expect(repository.list()).toHaveLength(0);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid capacity %s',
    (capacity) => {
      const { repository, service } = createService();

      const result = service.create({ ...validForm, capacity });

      expect(result).toEqual({
        success: false,
        errors: [{ field: 'capacity', code: 'invalid_capacity' }],
      });
      expect(repository.list()).toHaveLength(0);
    },
  );

  it.each([
    ['2026-02-30', '18:30', 'startDate'],
    ['2026-10-16', '24:00', 'startTime'],
  ])('rejects invalid date/time values (%s, %s)', (startDate, startTime, field) => {
    const { repository, service } = createService();

    const result = service.create({ ...validForm, startDate, startTime });

    expect(result).toEqual({
      success: false,
      errors: [{ field, code: 'invalid_format' }],
    });
    expect(repository.list()).toHaveLength(0);
  });
});