import DescopeClient from "@descope/node-sdk";

const projectId = process.env.DESCOPE_PROJECT_ID?.trim();
const managementKey = process.env.DESCOPE_MANAGEMENT_KEY?.trim();

export const descopeClient = DescopeClient({
  projectId: projectId ?? "",
  managementKey: managementKey ?? "",
});

export const CALENDAR_CONNECTION_ID =
  process.env.DESCOPE_CALENDAR_CONNECTION_ID?.trim() || "google-calendar";

export const CALENDAR_CONNECTION_LABEL = "Google Calendar";

/**
 * Least-privilege Google scopes for the implemented features:
 * - calendar.events: list/create/patch/delete events and create Meet links
 * - calendar.freebusy: availability lookups (checkCalendarBusy)
 * Override with DESCOPE_CALENDAR_SCOPES (space or comma separated).
 */
export const CALENDAR_SCOPES: string[] = (
  process.env.DESCOPE_CALENDAR_SCOPES?.trim() ||
  "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy"
)
  .split(/[\s,]+/)
  .filter(Boolean);
