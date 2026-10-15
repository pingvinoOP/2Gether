import type { SportsEvent } from './sports-event-form.js';

export interface SportsEventRepository {
  save(event: SportsEvent): void;
  findById(id: string): SportsEvent | undefined;
  list(): SportsEvent[];
}

export class InMemorySportsEventRepository implements SportsEventRepository {
  private readonly events = new Map<string, SportsEvent>();

  save(event: SportsEvent): void {
    this.events.set(event.id, this.copy(event));
  }

  findById(id: string): SportsEvent | undefined {
    const event = this.events.get(id);
    return event ? this.copy(event) : undefined;
  }

  list(): SportsEvent[] {
    return [...this.events.values()].map((event) => this.copy(event));
  }

  private copy(event: SportsEvent): SportsEvent {
    return { ...event, participants: [...event.participants] };
  }
}