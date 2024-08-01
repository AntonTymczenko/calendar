import EmailService from "./email-service";
import { IEvent } from "./event-service";
import UserService, { IUser } from "./user-service";

class MessageService {
  private emailService: EmailService;
  private userService: UserService;

  constructor(emailService: EmailService, userService: UserService) {
    this.emailService = emailService;
    this.userService = userService;
  }

  async sendCancellation(
    event: IEvent,
    userIds: IUser["id"][]
  ): Promise<boolean> {
    let everythingIsOkay = true;
    console.log({ everythingIsOkay });

    const users = await Promise.allSettled(
      userIds.map((userId) => this.userService.getById(userId))
    );

    if (users.filter((r) => r.status === "rejected").length) {
      everythingIsOkay = false;
    }
    console.log({ everythingIsOkay });

    const emails = users
      .filter((response) => response.status === "fulfilled")
      .map((user) => user.value.email);

    const title = event.title;
    const date = event.start.toLocaleString();

    const sendEmailResponses = await Promise.allSettled(
      emails.map((email) =>
        this.emailService.send(email, `Event "${title}" (${date}) was canceled`)
      )
    );

    if (sendEmailResponses.filter((r) => r.status === "rejected").length) {
      everythingIsOkay = false;
    }
    console.log({ everythingIsOkay });

    return everythingIsOkay;
  }
}

export default MessageService;
