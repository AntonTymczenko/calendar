import { IEvent, IEventPublic } from "../../services/event-service";
import { IRegisteredUser, IUser } from "../../services/user-service";
import { baseUrl, getRequestFn, registerUser } from "../test/helpers";

describe("API endpoint /user/events", () => {
  let owner: IRegisteredUser;
  let participant: IRegisteredUser;
  let requestByOwner: ReturnType<typeof getRequestFn>;
  let requestByParticipant: ReturnType<typeof getRequestFn>;

  beforeAll(async () => {
    owner = await registerUser({
      fullName: "John Owner",
      email: "j.owner@test.com",
    });
    participant = await registerUser({
      fullName: "Alice Foo",
      email: "a@test.com",
    });

    requestByOwner = getRequestFn(owner);
    requestByParticipant = getRequestFn(participant);
  });

  it("should show detialed list of user's events", async () => {
    const event1 = await requestByOwner("POST", `${baseUrl}/event/create`, {
      title: "Event 1",
      start: new Date("2001-01-01").toISOString(),
      participants: [participant.userId],
    });
    const event2 = await requestByOwner("POST", `${baseUrl}/event/create`, {
      title: "Event 2",
      start: new Date("2001-01-02").toISOString(),
      participants: [participant.userId],
    });
    const event3 = await requestByOwner("POST", `${baseUrl}/event/create`, {
      title: "Event 3",
      start: new Date("2001-01-03").toISOString(),
      participants: [participant.userId],
    });
    const event4 = await requestByOwner("POST", `${baseUrl}/event/create`, {
      title: "Event 4",
      start: new Date("2001-01-04").toISOString(),
      participants: ["foobar-user"],
    });

    const received = (await requestByParticipant(
      "GET",
      `${baseUrl}/user/events`
    )) as IEventPublic[];
    expect(received).toHaveLength(3);
    expect(received).toMatchObject([
      {
        id: expect.any(String),
        title: "Event 1",
        start: new Date("2001-01-01").toISOString(),
      },
      {
        id: expect.any(String),
        title: "Event 2",
        start: new Date("2001-01-02").toISOString(),
      },
      {
        id: expect.any(String),
        title: "Event 3",
        start: new Date("2001-01-03").toISOString(),
      },
    ]);
  });
});
