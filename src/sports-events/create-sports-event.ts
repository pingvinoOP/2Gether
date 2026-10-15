import { randomUUID } from 'node:crypto';
import type {
  CreateSportsEventForm,
  SportsEvent,
  SportsEventValidationError,
} from './sports-event-form.js';
import type { SportsEventRepository } from './sports-event-repository.js';
import { validateSportsEventForm } from './validate-sports-event-form.js';

export type CreateSportsEventResult =
  | { success: true; event: SportsEvent }
  | { success: false; errors: SportsEventValidationError[] };

export class CreateSportsEventService {
  constructor(
    private readonly events: SportsEventRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  create(form: CreateSportsEventForm): CreateSportsEventResult {
    const validation = validateSportsEventForm(form, this.now());
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const event: SportsEvent = {
      id: randomUUID(),
      ...validation.value,
    };
    this.events.save(event);
    return { success: true, event };
  }
}