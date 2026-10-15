import type { SportsEvent } from './sports-event-form.js';
import type { SportsEventRepository } from './sports-event-repository.js';

export type SportsEventParticipationError =
  | 'event_not_found'
  | 'invalid_participant'
  | 'already_joined'
  | 'event_full'
  | 'not_joined'
  | 'event_started';

export type SportsEventParticipationResult =
  | { success: true; event: SportsEvent }
  | { success: false; error: SportsEventParticipationError };

export class ManageSportsEventParticipationService {
  constructor(
    private readonly events: SportsEventRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  join(eventId: string, participantId: string): SportsEventParticipationResult {
    const event = this.events.findById(eventId);
    if (!event) return { success: false, error: 'event_not_found' };
    if (!participantId.trim()) return { success: false, error: 'invalid_participant' };
    if (event.participants.includes(participantId)) {
      return { success: false, error: 'already_joined' };
    }
    if (event.participants.length >= event.capacity) {
      return { success: false, error: 'event_full' };
    }

    event.participants.push(participantId);
    event.availablePlaces = event.capacity - event.participants.length;
    this.events.save(event);
    return { success: true, event };
  }

  leave(eventId: string, participantId: string): SportsEventParticipationResult {
    const event = this.events.findById(eventId);
    if (!event) return { success: false, error: 'event_not_found' };
    if (!participantId.trim()) return { success: false, error: 'invalid_participant' };
    if (!event.participants.includes(participantId)) {
      return { success: false, error: 'not_joined' };
    }
    if (new Date(event.startAt).getTime() <= this.now().getTime()) {
      return { success: false, error: 'event_started' };
    }

    event.participants = event.participants.filter((id) => id !== participantId);
    event.availablePlaces = event.capacity - event.participants.length;
    this.events.save(event);
    return { success: true, event };
  }
}
