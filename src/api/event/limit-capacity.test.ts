import { IEventPublic } from "../../services/event-service";
import { IRegisteredUser } from "../../services/user-service";
import { baseUrl, getRequestFn, registerUser } from "../test/helpers";

describe("API endpoint /event/:id/limit-capacity", () => {
  let owner: IRegisteredUser;
  let request: ReturnType<typeof getRequestFn>;
  let event: Pick<IEventPublic, "id">;

  beforeAll(async () => {
    owner = await registerUser({
      fullName: "John Owner",
      email: "j.owner@test.com",
    });
    request = getRequestFn(owner);

    const participant1 = await registerUser({
      fullName: "Alice",
      email: "a@test.com",
    });
    const participant2 = await registerUser({
      fullName: "Bob",
      email: "b@test.com",
    });

    event = await request("POST", `${baseUrl}/event/create`, {
      title: "Foobar",
      start: new Date().toISOString(),
      participants: [participant1.userId, participant2.userId],
    });
  });

  it("should be able to set capacity of an event", async () => {
    const received = await request(
      "POST",
      `${baseUrl}/event/${event.id}/limit-capacity`,
      { capacity: 10 }
    );

    expect(received).toMatchObject({ capacity: 10 });
  });

  it("should not be able to set capacity lower than the current number of participants", async () => {
    let received = null;

    expect(async () => {
      received = await request(
        "POST",
        `${baseUrl}/event/${event.id}/limit-capacity`,
        { capacity: 1 }
      );
    }).rejects.toThrow();

    expect(received).toBe(null);
  });
});
