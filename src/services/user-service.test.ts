import UserService from "./user-service";

describe("User service", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it("should register a user", async () => {
    const user = {
      email: "j.doe@test.com",
      fullName: "John Doe",
    };

    const received = await userService.register(user);

    expect(received).toMatchObject({
      userId: expect.any(String),
      accessToken: expect.any(String),
    });
  });
});
