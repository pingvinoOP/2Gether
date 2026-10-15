import type { SportsEvent } from './sports-event-form.js';
import type { SportsEventRepository } from './sports-event-repository.js';

export interface BrowseSportsEventsFilters {
  sport?: string;
  location?: string;
}

export interface SportsEventListing extends SportsEvent {
  date: string;
  time: string;
}

function normalizeFilter(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized || undefined;
}

export class BrowseSportsEventsService {
  constructor(
    private readonly events: SportsEventRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  list(filters: BrowseSportsEventsFilters = {}): SportsEventListing[] {
    const sport = normalizeFilter(filters.sport);
    const location = normalizeFilter(filters.location);
    const now = this.now().getTime();

    return this.events
      .list()
      .filter((event) => new Date(event.startAt).getTime() > now)
      .filter((event) => !sport || event.sport.toLowerCase() === sport)
      .filter((event) => !location || event.location.toLowerCase() === location)
      .sort((first, second) => first.startAt.localeCompare(second.startAt))
      .map((event) => {
        const startAt = new Date(event.startAt);
        return {
          ...event,
          date: startAt.toISOString().slice(0, 10),
          time: startAt.toISOString().slice(11, 16),
        };
      });
  }
}
