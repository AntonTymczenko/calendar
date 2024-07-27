import type { IncomingMessage, ServerResponse } from "http";
import UserService, { IUser } from "../../services/user-service";

export type APIRequest = IncomingMessage & {
  user?: Omit<IUser, "accessToken">;
};

export type APIRequestAuth = IncomingMessage & {
  user: Omit<IUser, "accessToken">;
};

export const APIAuth = (userService: UserService) => {
  return async (req: APIRequest): Promise<APIRequestAuth | null> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== "string") {
      return null;
    }

    const user = await userService.authenticate(authHeader.split(" ")[1]);

    if (!user) {
      return null;
    }

    const { accessToken, ...rest } = user;

    req.user = rest;

    return req as APIRequestAuth;
  };
};
