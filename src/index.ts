import http from "http";
import type { ServerResponse } from "http";
import EventService from "./event-service";
import UserService, { type IUser } from "./user-service";
import { handleUserRegister } from "./api/user/register";
import { APIAuth, APIRequest, APIRequestAuth } from "./api/middleware/auth";
import { handleEventCreate } from "./api/event/create";
import { handleEventParticipate } from "./api/event/participate";
import { ProtectedRouteType } from "./types";
import { handleEventListParticipants } from "./api/event/participants";

const port = 8080;

// services and middleware
const userService = new UserService();
const eventService = new EventService();
const handleAuth = APIAuth(userService);

// routes
const routes = {
  user: {
    register: handleUserRegister(userService),
  },
  event: {
    create: handleEventCreate(eventService),
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
          "GET",
          /^\/event\/[-a-f0-9]+\/participants$/,
          routes.event.participants,
        ],
      ] as ProtectedRouteType[]
    ).find(([method, matcher]) => {
      const isRegEx = matcher instanceof RegExp;

      return (
        req.method === method &&
        (isRegEx ? url.match(matcher) : url === matcher)
      );
    })?.[2];

    if (protectedRoute) {
      const authenticatedReq = await handleAuth(req, res);
      if (authenticatedReq) {
        return protectedRoute(authenticatedReq, res);
      }
    }

    res
      .writeHead(404, { "Content-Type": "application/json" })
      .end(JSON.stringify({ error: "Not found" }));
  }
);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
