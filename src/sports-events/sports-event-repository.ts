import type { SportsEvent } from './sports-event-form.js';

export interface SportsEventRepository {
  save(event: SportsEvent): void;
}

export class InMemorySportsEventRepository implements SportsEventRepository {
  private readonly events = new Map<string, SportsEvent>();

  save(event: SportsEvent): void {
    this.events.set(event.id, { ...event });
  }

  findById(id: string): SportsEvent | undefined {
    const event = this.events.get(id);
    return event ? { ...event } : undefined;
  }

  list(): SportsEvent[] {
    return [...this.events.values()].map((event) => ({ ...event }));
  }
}