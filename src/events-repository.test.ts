import EventsService, {
  IEvent,
  IEventPublic,
  INewEvent,
} from "./events-repository";

describe("Events repository", () => {
  describe("owner", () => {
    const currentUserId = "xxx";
    let eventsService: EventsService;

    beforeEach(() => {
      eventsService = new EventsService();
    });

    it("should create an event with minimal args", async () => {
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
      const toCreate = {
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

    it("should get details of an owned event", async () => {
      // first, create an event
      const event = {
        start: new Date("2020-01-01"),
        title: "Foobar",
      };
      const created = await eventsService.create(currentUserId, event);

      // assess the getById feature
      const received = await eventsService.getById(currentUserId, created.id);

      expect(received).toMatchObject({
        ...event,
        ownerId: currentUserId,
      });

      expect(received.participants).toMatchObject(expect.arrayContaining([]));
    });

    it("should not get details of an event where not an owner", async () => {
      // create as a default user
      const event = {
        start: new Date("2020-01-01"),
        title: "Foobar",
      };
      const created = await eventsService.create(currentUserId, event);

      // try to access as another user
      let received = null;

      expect(async () => {
        received = await eventsService.getById("yyy", created.id);
      }).rejects.toThrow(/not found/i);

      expect(received).toBe(null);
    });

    it("should see the list of participants of an event", async () => {
      const event = {
        start: new Date("2020-01-01"),
        title: "Foobar",
        participants: ["alice-id", "bob-id", "charlie-id"],
      };
      const created = await eventsService.create(currentUserId, event);

      const receivedDetails = await eventsService.getById(
        currentUserId,
        created.id
      );

      expect(receivedDetails.participants).toMatchObject(event.participants);
    });

    it("should remove participant by id", async () => {
      const event = {
        start: new Date("2020-01-01"),
        title: "Foobar",
        participants: ["alice-id", "bob-id", "charlie-id"],
      };
      const created = await eventsService.create(currentUserId, event);

      const response = await eventsService.removeParticipant(
        currentUserId,
        created.id,
        "bob-id"
      );
      expect(response).toBe(true);

      const receivedDetails = await eventsService.getById(
        currentUserId,
        created.id
      );

      expect(receivedDetails.participants).toMatchObject([
        "alice-id",
        "charlie-id",
      ]);
    });

    it("should update the list of participants", async () => {
      const event = {
        start: new Date("2020-01-01"),
        title: "Foobar",
        participants: ["alice-id", "bob-id", "charlie-id"],
      };
      const created = await eventsService.create(currentUserId, event);

      const expected = ["bob-id", "dora-id"];
      const response = await eventsService.updateParticipantsList(
        currentUserId,
        created.id,
        expected
      );
      expect(response).toBe(true);

      const receivedDetails = await eventsService.getById(
        currentUserId,
        created.id
      );

      expect(receivedDetails.participants).toMatchObject(expected);
    });

    it("should limit capacity of an event", async () => {
      const event = {
        start: new Date("2020-01-01"),
        title: "Foobar",
      };
      const created = await eventsService.create(currentUserId, event);

      const received = await eventsService.updateCapacity(
        currentUserId,
        created.id,
        10
      );

      expect(received).toBe(true);

      const receivedDetails = await eventsService.getById(
        currentUserId,
        created.id
      );

      expect(receivedDetails.capacity).toBe(10);
    });

    it("should not limit capacity if there are more participants", async () => {
      const event = {
        start: new Date("2020-01-01"),
        title: "Foobar",
        capacity: 100,
        participants: ["x", "y", "z"],
      };
      const created = await eventsService.create(currentUserId, event);

      let received = null;

      expect(async () => {
        received = await eventsService.updateCapacity(
          currentUserId,
          created.id,
          2
        );
      }).rejects.toThrow(/cannot update/i);

      expect(received).toBe(null);

      const receivedDetails = await eventsService.getById(
        currentUserId,
        created.id
      );

      expect(receivedDetails.capacity).toBe(event.capacity);
    });
  });

  describe("participant", () => {
    let eventsService: EventsService;

    const ownerId = "owner-xxx";
    let event: IEvent;

    beforeAll(async () => {
      eventsService = new EventsService();
      event = await eventsService.create(ownerId, {
        start: new Date("2024-09-09"),
        title: "Birthday party",
      });
    });

    it("should be able to register at an event", async () => {
      const participant = "john-id";
      const available: IEventPublic[] = await eventsService.listAvailable(
        participant
      );

      const eventId = available[0].id;

      const received = await eventsService.register(participant, eventId);

      expect(received).not.toBe(null);

      const listed = await eventsService.listMyParticipation(participant);

      expect(listed).toMatchObject([expect.objectContaining({ id: eventId })]);
    });
  });
});
