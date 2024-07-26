import type { IncomingMessage, ServerResponse } from "http";
import UserService from "../../user-service";

export const handleUserRegister =
  (userService: UserService) => (req: IncomingMessage, res: ServerResponse) => {
    let body = "";

    // TODO: centralize all 'data' events in one place
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const { email, fullName } = JSON.parse(body);
        const { userId, accessToken } = await userService.register({
          email,
          fullName,
        });

        return res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify({ accessToken, id: userId }));
      } catch (e) {
        console.error(e);
      }

      res.writeHead(500).end();
    });
  };
