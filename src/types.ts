import type { IncomingMessage, ServerResponse } from "http";
import { APIRequestAuth } from "./api/middleware/auth";

export type ProtectedRouteType = [
  "POST" | "GET",
  string | RegExp,
  (req: APIRequestAuth, res: ServerResponse<IncomingMessage>) => void
];
