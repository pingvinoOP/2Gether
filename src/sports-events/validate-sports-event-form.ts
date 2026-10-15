import type {
  CreateSportsEventForm,
  SportsEventValidationError,
  ValidatedSportsEventDetails,
} from './sports-event-form.js';

export type SportsEventFormValidation =
  | { valid: true; value: ValidatedSportsEventDetails }
  | { valid: false; errors: SportsEventValidationError[] };

function normalizeText(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  return Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date;
}

function isValidTime(time: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export function validateSportsEventForm(
  form: CreateSportsEventForm,
  now: Date = new Date(),
): SportsEventFormValidation {
  const sport = normalizeText(form.sport);
  const location = normalizeText(form.location);
  const startDate = normalizeText(form.startDate);
  const startTime = normalizeText(form.startTime);
  const organizerId = normalizeText(form.organizerId);
  const errors: SportsEventValidationError[] = [];

  if (!sport) errors.push({ field: 'sport', code: 'required' });
  if (!location) errors.push({ field: 'location', code: 'required' });
  if (!organizerId) errors.push({ field: 'organizerId', code: 'required' });

  const validDate = isValidDate(startDate);
  const validTime = isValidTime(startTime);
  if (!startDate) {
    errors.push({ field: 'startDate', code: 'required' });
  } else if (!validDate) {
    errors.push({ field: 'startDate', code: 'invalid_format' });
  }

  if (!startTime) {
    errors.push({ field: 'startTime', code: 'required' });
  } else if (!validTime) {
    errors.push({ field: 'startTime', code: 'invalid_format' });
  }

  if (form.capacity === undefined || form.capacity === null) {
    errors.push({ field: 'capacity', code: 'required' });
  } else if (!Number.isSafeInteger(form.capacity) || form.capacity <= 0) {
    errors.push({ field: 'capacity', code: 'invalid_capacity' });
  }

  let startAt: string | undefined;
  if (validDate && validTime) {
    const start = new Date(`${startDate}T${startTime}:00.000Z`);
    startAt = start.toISOString();
    if (start.getTime() < now.getTime()) {
      errors.push({ field: 'startDate', code: 'past' });
    }
  }

  if (errors.length > 0 || startAt === undefined || typeof form.capacity !== 'number') {
    return { valid: false, errors };
  }

  return {
    valid: true,
    value: {
      sport,
      location,
      startAt,
      capacity: form.capacity,
      organizerId,
    },
  };
}