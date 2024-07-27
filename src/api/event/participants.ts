import type { ServerResponse } from "http";
import { APIRequestAuth } from "../middleware/auth";
import EventService from "../../event-service";
import UserService from "../../user-service";

export const handleEventListParticipants =
  (eventService: EventService, userService: UserService) =>
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

        const participantIds = await eventService.getEventParticipants(
          req.user.id,
          eventId
        );

        const participants = await userService.list(participantIds);

        return res.writeHead(200).end(JSON.stringify(participants));
      } catch (e) {
        console.error(e);
      }

      res.writeHead(500).end();
    });
  };
