import { IEvent } from "../../services/event-service";
import { IRegisteredUser } from "../../services/user-service";
import { baseUrl, getRequestFn, registerUser } from "../test/helpers";

describe("API endpoint /event/:id/participants", () => {
  let owner: IRegisteredUser;
  let request: ReturnType<typeof getRequestFn>;

  beforeAll(async () => {
    owner = await registerUser({
      fullName: "John Owner",
      email: "j.owner@test.com",
    });
    request = getRequestFn(owner);
  });

  it("should show detialed participants list with names", async () => {
    const participant1 = await registerUser({
      fullName: "Alice",
      email: "a@test.com",
    });
    const participant2 = await registerUser({
      fullName: "Bob",
      email: "b@test.com",
    });

    const event = (await request("POST", `${baseUrl}/event/create`, {
      title: "Foobar",
      start: new Date().toISOString(),
      participants: [participant1.userId, participant2.userId],
    })) as { id: IEvent["id"] };

    const received = await request(
      "GET",
      `${baseUrl}/event/${event.id}/participants`
    );

    expect(received).toHaveLength(2);
    expect(received).toMatchObject([
      { id: expect.any(String), fullName: "Alice" },
      { id: expect.any(String), fullName: "Bob" },
    ]);
  });
});
