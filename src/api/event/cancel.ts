import type { ServerResponse } from "http";
import { APIRequestAuth } from "../middleware/auth";
import EventService from "../../services/event-service";
import MessageService from "../../services/message-service";

export const handleEventCancel =
  (eventService: EventService, messageService: MessageService) =>
  (req: APIRequestAuth, res: ServerResponse) => {
    req.on("data", () => {});

    req.on("end", async () => {
      try {
        const eventId = (req.url ?? "").split("/")?.[2];

        if (!eventId) {
          return res
            .writeHead(400)
            .end(JSON.stringify({ error: "Bad event ID" }));
        }

        const participantIds = await eventService.cancel(req.user.id, eventId);

        const event = await eventService.getById(req.user.id, eventId);

        const okay = await messageService.sendCancellation(
          event,
          participantIds
        );

        return res
          .writeHead(200)
          .end(JSON.stringify({ canceled: true, allSent: okay }));
      } catch (e) {
        console.error(e);
      }

      res.writeHead(500).end();
    });
  };
