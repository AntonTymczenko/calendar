import type { ServerResponse } from "http";
import { APIRequestAuth } from "../middleware/auth";
import EventService from "../../services/event-service";
import UserService from "../../services/user-service";

export const handleEventLimitCapacity =
  (eventService: EventService) =>
  (req: APIRequestAuth, res: ServerResponse) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      let capacity: number;

      try {
        const payload = JSON.parse(body);

        capacity = payload?.capacity;

        if (capacity === undefined) {
          throw new Error(`Bad request. Body: "${body}"`);
        }
      } catch (e) {
        console.error(e);
        return res.writeHead(400).end();
      }

      try {
        const eventId = (req.url ?? "").split("/")?.[2];

        if (!eventId) {
          return res
            .writeHead(400)
            .end(JSON.stringify({ error: "Bad event ID" }));
        }

        const ok = await eventService.updateCapacity(
          req.user.id,
          eventId,
          capacity
        );

        if (!ok) {
          return res.writeHead(400).end();
        }

        return res.writeHead(200).end(JSON.stringify({ capacity }));
      } catch (e) {
        console.error(e);
      }

      res.writeHead(500).end();
    });
  };
