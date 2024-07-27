import type { IncomingMessage, ServerResponse } from "http";
import UserService from "../../services/user-service";

export const handleUserRegister =
  (userService: UserService) => (req: IncomingMessage, res: ServerResponse) => {
    let body = "";

    // TODO: centralize all 'data' events in one place
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      let email = null;
      let fullName = null;

      try {
        const payload = JSON.parse(body);

        email = payload?.email;
        fullName = payload?.fullName;

        if (!email || !fullName) {
          throw new Error(`Bad request. Body: "${body}"`);
        }
      } catch (e) {
        console.error(e);
        return res.writeHead(400).end();
      }

      try {
        const { userId, accessToken } = await userService.register({
          email,
          fullName,
        });

        return res
          .writeHead(200, { "Content-Type": "application/json" })
          .end(JSON.stringify({ accessToken, userId }));
      } catch (e) {
        console.error(e);
      }

      res.writeHead(500).end();
    });
  };
