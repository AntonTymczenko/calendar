import http from "http";
import type { ServerResponse } from "http";
import EventService from "./event-service";
import UserService, { type IUser } from "./user-service";
import { handleUserRegister } from "./api/user/register";
import { APIAuth, APIRequest } from "./api/middleware/auth";
import { handleEventCreate } from "./api/event/create";

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
  },
};

const protectedRoutes = ["/event/create"];

// API
const server = http.createServer(
  async (req: APIRequest, res: ServerResponse) => {
    if (protectedRoutes.includes(req.url ?? "")) {
      const authenticatedReq = await handleAuth(req, res);
      if (authenticatedReq) {
        if (req.method === "POST" && req.url === "/event/create") {
          routes.event.create(authenticatedReq, res);
        }
      }
    } else if (req.method === "POST" && req.url === "/user/register") {
      routes.user.register(req, res);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
    }
  }
);

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
