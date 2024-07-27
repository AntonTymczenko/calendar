import type { ServerResponse } from "http";
import EventService from "../../event-service";
import { APIRequestAuth } from "../middleware/auth";

export const handleEventParticipate =
  (eventService: EventService) =>
  (req: APIRequestAuth, res: ServerResponse) => {
    req.on("data", () => {});

    req.on("end", async () => {
      try {
        const eventId = (req.url ?? "").split("/")?.[2];

        if (!eventId) {
          return res
            .writeHead(400)
            .end(JSON.stringify({ error: "Not created" }));
        }

        const ok = await eventService.participate(req.user.id, eventId);
        if (!ok) {
          throw new Error("Failed to register a user as a participant");
        }

        return res.writeHead(201).end();
      } catch (e) {
        console.error(e);
      }

      res.writeHead(500).end();
    });
  };
