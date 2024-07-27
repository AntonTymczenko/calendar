import type { ServerResponse } from "http";
import EventService from "../../services/event-service";
import { APIRequestAuth } from "../middleware/auth";

/**
 * Lists events participated by a user
 */
export const handleUserListParticipated =
  (eventService: EventService) =>
  (req: APIRequestAuth, res: ServerResponse) => {
    req.on("data", () => {});

    req.on("end", async () => {
      try {
        const events = await eventService.listMyParticipation(req.user.id);

        return res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify(events));
      } catch (e) {
        console.error(e);
      }

      res.writeHead(500).end();
    });
  };
