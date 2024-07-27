import http from "http";
import type { ServerResponse } from "http";
import EventService from "./services/event-service";
import UserService, { type IUser } from "./services/user-service";
import { ProtectedRouteType } from "./types";
import { handleUserRegister } from "./api/user/register";
import { APIAuth, APIRequest, APIRequestAuth } from "./api/middleware/auth";
import { handleEventCreate } from "./api/event/create";
import { handleEventParticipate } from "./api/event/participate";
import { handleEventListParticipants } from "./api/event/participants";
import { handleUserListParticipated } from "./api/user/events";
import { handleEventLimitCapacity } from "./api/event/limit-capacity";

const port = 8080;

// services and middleware
const userService = new UserService();
const eventService = new EventService();
const handleAuth = APIAuth(userService);

// routes
const routes = {
  user: {
    register: handleUserRegister(userService),
    events: handleUserListParticipated(eventService),
  },
  event: {
    create: handleEventCreate(eventService),
    limitCapacity: handleEventLimitCapacity(eventService),
    participate: handleEventParticipate(eventService),
    participants: handleEventListParticipants(eventService, userService),
  },
};

const protectedRoutes = ["/event/create", "/event/"];

// API
const server = http.createServer(
  async (req: APIRequest, res: ServerResponse) => {
    if (req.method === "POST" && req.url === "/user/register") {
      return routes.user.register(req, res);
    }

    const url = req.url ?? "";

    const protectedRoute = (
      [
        ["POST", "/event/create", routes.event.create],
        [
          "POST",
          /^\/event\/[-a-f0-9]+\/participate$/,
          routes.event.participate,
        ],
        [
          "POST",
          /^\/event\/[-a-f0-9]+\/limit-capacity$/,
          routes.event.limitCapacity,
        ],
        [
          "GET",
          /^\/event\/[-a-f0-9]+\/participants$/,
          routes.event.participants,
        ],
        ["GET", "/user/events", routes.user.events],
      ] as ProtectedRouteType[]
    ).find(([method, matcher]) => {
      const isRegEx = matcher instanceof RegExp;

      return (
        req.method === method &&
        (isRegEx ? url.match(matcher) : url === matcher)
      );
    })?.[2];

    if (protectedRoute) {
      const authenticatedReq = await handleAuth(req);
      if (!authenticatedReq) {
        return res
          .writeHead(401, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Access denied" }));
      }

      return protectedRoute(authenticatedReq, res);
    }

    res
      .writeHead(404, { "Content-Type": "application/json" })
      .end(JSON.stringify({ error: "Not found" }));
  }
);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
