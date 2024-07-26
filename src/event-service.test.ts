import EventService, { IEvent, IEventPublic, INewEvent } from "./event-service";

describe("Event service", () => {
  describe("owner", () => {
    const currentUserId = "xxx";
    let eventService: EventService;

    beforeEach(() => {
      eventService = new EventService();
    });

    it("should create an event with minimal args", async () => {
      const toCreate: INewEvent = {
        start: new Date("2020-01-01"),
        title: "Foobar",
      };
      const received = await eventService.create(currentUserId, toCreate);

      const expected: IEvent = {
        id: expect.any(String),
        start: toCreate.start,
        title: toCreate.title,
        ownerId: currentUserId,
        capacity: null,
        participants: [],
      };

      expect(received).not.toBe(null);
      expect(received).toMatchObject(expected);

      const receivedById = await eventService.getById(
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

      const received = await eventService.create(currentUserId, toCreate);

      const expected: IEvent = {
        id: expect.any(String),
        start: toCreate.start,
        title: toCreate.title,
        ownerId: currentUserId,
        capacity: toCreate.capacity,
        participants: toCreate.participants,
      };

      expect(received).toMatchObject(expected);

      const receivedById = await eventService.getById(
        currentUserId,
        received.id
      );

      expect(receivedById).toMatchObject(expected);
    });

    test.each([null, undefined])(
      "should not create if no ownerId provided",
      async (ownerId) => {
        const toCreate: INewEvent = {
          start: new Date("2020-01-01"),
          title: "Foobar",
        };

        let received = null;
        expect(async () => {
          // @ts-ignore
          received = await eventService.create(ownerId, toCreate);
        }).rejects.toThrow(/cannot create/i);

        expect(received).toBe(null);
      }
    );

    it("should get details of an owned event", async () => {
      // first, create an event
      const event = {
        start: new Date("2020-01-01"),
        title: "Foobar",
      };
      const created = await eventService.create(currentUserId, event);

      // assess the getById feature
      const received = await eventService.getById(currentUserId, created.id);

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
      const created = await eventService.create(currentUserId, event);

      // try to access as another user
      let received = null;

      expect(async () => {
        received = await eventService.getById("yyy", created.id);
      }).rejects.toThrow(/not found/i);

      expect(received).toBe(null);
    });

    it("should see the list of participants of an event", async () => {
      const event = {
        start: new Date("2020-01-01"),
        title: "Foobar",
        participants: ["alice-id", "bob-id", "charlie-id"],
      };
      const created = await eventService.create(currentUserId, event);

      const receivedDetails = await eventService.getById(
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
      const created = await eventService.create(currentUserId, event);

      const response = await eventService.removeParticipant(
        currentUserId,
        created.id,
        "bob-id"
      );
      expect(response).toBe(true);

      const receivedDetails = await eventService.getById(
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
      const created = await eventService.create(currentUserId, event);

      const expected = ["bob-id", "dora-id"];
      const response = await eventService.updateParticipantsList(
        currentUserId,
        created.id,
        expected
      );
      expect(response).toBe(true);

      const receivedDetails = await eventService.getById(
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
      const created = await eventService.create(currentUserId, event);

      const received = await eventService.updateCapacity(
        currentUserId,
        created.id,
        10
      );

      expect(received).toBe(true);

      const receivedDetails = await eventService.getById(
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
      const created = await eventService.create(currentUserId, event);

      let received = null;

      expect(async () => {
        received = await eventService.updateCapacity(
          currentUserId,
          created.id,
          2
        );
      }).rejects.toThrow(/cannot update/i);

      expect(received).toBe(null);

      const receivedDetails = await eventService.getById(
        currentUserId,
        created.id
      );

      expect(receivedDetails.capacity).toBe(event.capacity);
    });
  });

  describe("participant", () => {
    let eventService: EventService;

    const ownerId = "owner-xxx";
    let event: IEvent;

    beforeAll(async () => {
      eventService = new EventService();
      event = await eventService.create(ownerId, {
        start: new Date("2024-09-09"),
        title: "Birthday party",
      });
    });

    it("should be able to register at an event, list available, list my", async () => {
      const participant = "john-id";

      // list available events
      const available: IEventPublic[] = await eventService.listAvailable(
        participant
      );

      const eventId = available[0].id;

      // register to an event
      const received = await eventService.register(participant, eventId);

      expect(received).not.toBe(null);

      // list where I have registered
      const listed = await eventService.listMyParticipation(participant);

      expect(listed).toMatchObject([expect.objectContaining({ id: eventId })]);
    });
  });
});
