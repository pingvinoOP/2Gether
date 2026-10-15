export interface CreateSportsEventForm {
  sport?: string;
  location?: string;
  startDate?: string;
  startTime?: string;
  capacity?: number;
  organizerId?: string;
}

export type SportsEventFormField = keyof CreateSportsEventForm;

export interface SportsEventValidationError {
  field: SportsEventFormField;
  code: 'required' | 'invalid_format' | 'past' | 'invalid_capacity';
}

export interface ValidatedSportsEventDetails {
  sport: string;
  location: string;
  startAt: string;
  capacity: number;
  organizerId: string;
}

export interface SportsEvent extends ValidatedSportsEventDetails {
  id: string;
}