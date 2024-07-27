import type { IncomingMessage, ServerResponse } from "http";
import UserService, { IUser } from "../../user-service";

export type APIRequest = IncomingMessage & {
  user?: Omit<IUser, "accessToken">;
};

export type APIRequestAuth = IncomingMessage & {
  user: Omit<IUser, "accessToken">;
};

export const APIAuth = (userService: UserService) => {
  return async (
    req: APIRequest,
    res: ServerResponse
  ): Promise<APIRequestAuth | null> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== "string") {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No token provided" }));
      return null;
    }

    const user = await userService.authenticate(authHeader.split(" ")[1]);

    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Access denied" }));
      return null;
    }

    const { accessToken, ...rest } = user;

    req.user = rest;

    return req as APIRequestAuth;
  };
};
