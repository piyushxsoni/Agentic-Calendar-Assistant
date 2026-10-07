import DescopeClient from "@descope/node-sdk";

const projectId = process.env.DESCOPE_PROJECT_ID?.trim();
const managementKey = process.env.DESCOPE_MANAGEMENT_KEY?.trim();

if (!projectId) {
  console.warn("DESCOPE_PROJECT_ID is not set");
}

export const descopeClient = DescopeClient({
  projectId: projectId ?? "",
  managementKey: managementKey ?? "",
});

export const CALENDAR_CONNECTION_ID =
  process.env.DESCOPE_CALENDAR_CONNECTION_ID ?? "google-calendar";

export const CALENDAR_CONNECTION_LABEL = "Google Calendar";
