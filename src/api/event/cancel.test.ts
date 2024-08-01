import { IEventPublic } from "../../services/event-service";
import { IRegisteredUser, IUser } from "../../services/user-service";
import { baseUrl, getRequestFn, registerUser } from "../test/helpers";

describe("API endpoint /event/:id/cancel", () => {
  let owner: IRegisteredUser;
  let requestOwner: ReturnType<typeof getRequestFn>;
  let requestParticipant: ReturnType<typeof getRequestFn>;
  let event: Pick<IEventPublic, "id">;
  let participant1: IRegisteredUser;

  beforeEach(async () => {
    owner = await registerUser({
      fullName: "John Owner",
      email: "j.owner@test.com",
    });
    requestOwner = getRequestFn(owner);

    participant1 = await registerUser({
      fullName: "Alice",
      email: "a@test.com",
    });
    requestParticipant = getRequestFn(participant1);

    event = await requestOwner("POST", `${baseUrl}/event/create`, {
      title: "Foobar",
      start: new Date().toISOString(),
      participants: [participant1.userId],
    });
  });

  it("should be able to cancel", async () => {
    const myEvents1 = await requestParticipant("GET", `${baseUrl}/user/events`);
    expect(myEvents1).toHaveLength(1);
    expect(myEvents1).toMatchObject([{ id: event.id }]);

    const received = await requestOwner(
      "POST",
      `${baseUrl}/event/${event.id}/cancel`
    );

    expect(received).toMatchObject({ canceled: true, allSent: true });

    const myEvents2 = await requestParticipant("GET", `${baseUrl}/user/events`);

    expect(myEvents2).toHaveLength(0);
  });
});
