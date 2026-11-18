import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  cancelMeeting,
  checkCalendarBusy,
  createMeeting,
  listUpcomingMeetings,
  rescheduleMeeting,
} from "./calendar.service.js";

// ISO-8601 datetime that MUST carry an offset (Z or +hh:mm) so Google never guesses a timezone.
const isoWithOffset = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/,
    "Use ISO-8601 with a timezone offset, e.g. 2026-10-20T10:00:00+05:30",
  );

function endAfterStart(v: { startIso: string; endIso: string }) {
  return Date.parse(v.endIso) > Date.parse(v.startIso);
}
const endAfterStartMsg = { message: "endIso must be after startIso", path: ["endIso"] };

export function createCalendarTools(authUserId: string) {
  return {
    listUpcomingMeetings: createTool({
      id: "listUpcomingMeetings",
      description:
        "List Google Calendar events. Set todayOnly=true for today's agenda only.",
      inputSchema: z.object({
        maxResults: z.number().int().min(1).max(20).optional(),
        todayOnly: z
          .boolean()
          .optional()
          .describe("If true, only return events for today"),
      }),
      execute: async ({ maxResults, todayOnly }) => {
        return await listUpcomingMeetings({
          authUserId,
          maxResults,
          todayOnly,
        });
      },
    }),

    checkCalendarBusy: createTool({
      id: "checkCalendarBusy",
      description:
        "Check if the user is busy between two ISO datetimes using Google freebusy.",
      inputSchema: z.object({
        startIso: isoWithOffset,
        endIso: isoWithOffset,
      }).refine(endAfterStart, endAfterStartMsg),
      execute: async ({ startIso, endIso }) => {
        return await checkCalendarBusy({
          authUserId,
          startIso,
          endIso,
        });
      },
    }),
    createMeeting: createTool({
      id: "createMeeting",
      description:
        "Create a Google Calendar event. Adds a Google Meet link by default. Emails invitees when attendeeEmails are set.",
      inputSchema: z.object({
        title: z.string().min(1),
        startIso: isoWithOffset,
        endIso: isoWithOffset,
        attendeeEmails: z
          .array(z.email())
          .optional()
          .describe("Invite these emails; Google sends calendar invites"),
        description: z.string().optional(),
        addGoogleMeet: z
          .boolean()
          .optional()
          .describe("Default true. Set false to skip Google Meet link"),
      }).refine(endAfterStart, endAfterStartMsg),
      execute: async (input) => {
        return await createMeeting({
          authUserId,
          ...input,
        });
      },
    }),

    rescheduleMeeting: createTool({
      id: "rescheduleMeeting",
      description:
        "Move an existing event to a new start/end time and email invitees.",
      inputSchema: z.object({
        eventId: z.string().min(1),
        startIso: isoWithOffset,
        endIso: isoWithOffset,
      }).refine(endAfterStart, endAfterStartMsg),

      execute: async (input) => {
        return await rescheduleMeeting({ authUserId, ...input });
      },
    }),

    cancelMeeting: createTool({
      id: "cancelMeeting",
      description:
        "Cancel a Google Calendar event by id and email attendees. DESTRUCTIVE: first show the user the event title/time and ask them to confirm; only call with confirmed=true after they explicitly say yes.",
      inputSchema: z.object({
        eventId: z.string().min(1),
        confirmed: z
          .literal(true)
          .describe("Must be true; set only after the user explicitly confirmed this cancellation"),
      }),
      execute: async (input) => {
        return await cancelMeeting({
          authUserId,
          eventId: input.eventId,
        });
      },
    }),
  };
}
