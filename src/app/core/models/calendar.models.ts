/**
 * Calendar Event Models
 * Maps to backend DTOs from /api/event endpoints
 */

export enum RecurrenceFrequency {
  None = 'none',
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
}

/** Maps RecurrenceFrequency to iCal RRULE string (used by backend) */
export function toRRule(freq: RecurrenceFrequency): string | null {
  switch (freq) {
    case RecurrenceFrequency.Daily:
      return 'FREQ=DAILY;INTERVAL=1';
    case RecurrenceFrequency.Weekly:
      return 'FREQ=WEEKLY;INTERVAL=1';
    case RecurrenceFrequency.Monthly:
      return 'FREQ=MONTHLY;INTERVAL=1';
    case RecurrenceFrequency.Yearly:
      return 'FREQ=YEARLY;INTERVAL=1';
    default:
      return null;
  }
}

/** Maps iCal RRULE string back to RecurrenceFrequency */
export function fromRRule(rrule: string | null | undefined): RecurrenceFrequency {
  if (!rrule) return RecurrenceFrequency.None;
  if (rrule.includes('FREQ=DAILY')) return RecurrenceFrequency.Daily;
  if (rrule.includes('FREQ=WEEKLY')) return RecurrenceFrequency.Weekly;
  if (rrule.includes('FREQ=MONTHLY')) return RecurrenceFrequency.Monthly;
  if (rrule.includes('FREQ=YEARLY')) return RecurrenceFrequency.Yearly;
  return RecurrenceFrequency.None;
}

/** Calendar event as returned by the backend */
export interface CalendarEvent {
  id: string;
  title: string;
  location: string | null;
  startDate: string;   // ISO 8601
  endDate: string | null;
  phone: string | null;
  recurrenceRule: string | null;  // iCal RRULE
  color: string | null;
  isDeleted: boolean;
}

/** Request body for POST /api/event */
export interface CalendarEventCreate {
  title: string;
  location?: string | null;
  startDate: string;   // ISO 8601
  endDate?: string | null;
  phone?: string | null;
  recurrenceRule?: string | null;
  color?: string | null;
}

/** Request body for PUT /api/event/{id} */
export interface CalendarEventUpdate {
  title?: string;
  location?: string | null;
  startDate?: string;
  endDate?: string | null;
  phone?: string | null;
  recurrenceRule?: string | null;
  color?: string | null;
}

/** Response from GET /api/event?year=&month= */
export interface CalendarMonthResponse {
  events: CalendarEvent[];
  totalCount: number;
}
