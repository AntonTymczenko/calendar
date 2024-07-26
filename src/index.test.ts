import EventsService, { IEvent, INewEvent } from "./events-repository";

describe("Events repository", () => {
  let eventsService: EventsService;

  beforeEach(() => {
    eventsService = new EventsService();
  });

  it("should create an event with minimal args", async () => {
    const currentUserId = "xxx";
    const toCreate: INewEvent = {
      start: new Date("2020-01-01"),
      title: "Foobar",
    };
    const received = await eventsService.create(currentUserId, toCreate);

    const expected: IEvent = {
      id: expect.any(String),
      start: toCreate.start,
      title: toCreate.title,
      ownerId: currentUserId,
      capacity: null,
      participants: [],
    };

    expect(received).toMatchObject(expected);

    const receivedById = await eventsService.getById(
      currentUserId,
      received.id
    );

    expect(receivedById).toMatchObject(expected);
  });

  it("should create an event with all args", async () => {
    const currentUserId = "xxx";

    const toCreate: INewEvent = {
      start: new Date("2020-01-01"),
      title: "Foobar",
      capacity: 10,
      participants: [currentUserId],
    };

    const received = await eventsService.create(currentUserId, toCreate);

    const expected: IEvent = {
      id: expect.any(String),
      start: toCreate.start,
      title: toCreate.title,
      ownerId: currentUserId,
      capacity: toCreate.capacity,
      participants: toCreate.participants,
    };

    expect(received).toMatchObject(expected);

    const receivedById = await eventsService.getById(
      currentUserId,
      received.id
    );

    expect(receivedById).toMatchObject(expected);
  });

  it("should get details of an owned event", () => {});
});
