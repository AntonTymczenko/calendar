import type { ServerResponse } from "http";
import EventService, { INewEvent } from "../../event-service";
import { APIRequestAuth } from "../middleware/auth";

export const handleEventParticipate =
  (eventService: EventService) =>
  (req: APIRequestAuth, res: ServerResponse) => {
    let body = "";

    req.on("end", async () => {
      try {
        const eventId = (req.url ?? "").split("/");
        console.log(eventId);

        if (!eventId) {
          return res
            .writeHead(400)
            .end(JSON.stringify({ error: "Not created" }));
        }

        await eventService.participate(req.user.id, "xx");

        return res.writeHead(201).end();
      } catch (e) {
        console.error(e);
      }

      res.writeHead(500).end();
    });
  };
