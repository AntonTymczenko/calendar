import type { ServerResponse } from "http";
import EventService, { INewEvent } from "../../services/event-service";
import { APIRequestAuth } from "../middleware/auth";

export const handleEventCreate =
  (eventService: EventService) =>
  (req: APIRequestAuth, res: ServerResponse) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const payloadRaw = JSON.parse(body) as INewEvent;

        // TODO: validate raw payload
        const payload = {
          ...payloadRaw,
          start: new Date(payloadRaw.start),
        };

        const event = await eventService.create(req.user.id, payload);

        if (!event?.id) {
          return res
            .writeHead(400)
            .end(JSON.stringify({ error: "Not created" }));
        }

        const response = JSON.stringify({ id: event.id });

        return res
          .writeHead(201, { "Content-Type": "application/json" })
          .end(response);
      } catch (e) {
        console.error(e);
      }

      res.writeHead(500).end();
    });
  };
