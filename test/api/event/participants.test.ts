import { IEvent } from "../../../src/event-service";
import { IRegisteredUser, IUser } from "../../../src/user-service";

const baseUrl = "http://localhost:8080";

async function req(url: string, payload: any, options?: any) {
  const response = await fetch(url, {
    ...(payload ? { body: JSON.stringify(payload) } : {}),
    ...(options || {}),
  });
  const data = await response?.json();

  return data;
}

async function registerUser(
  payload: Pick<IUser, "fullName" | "email">
): Promise<IRegisteredUser> {
  return req(`${baseUrl}/user/register`, payload, {
    method: "POST",
  });
}

describe("API endpoint /event/:id/participants", () => {
  let owner: IRegisteredUser;

  async function request(method: "POST" | "GET", url: string, payload?: any) {
    return req(url, payload, {
      method,
      headers: {
        authorization: `Bearer ${owner.accessToken}`,
      },
    });
  }

  beforeAll(async () => {
    owner = await registerUser({
      fullName: "John Owner",
      email: "j.owner@test.com",
    });
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
