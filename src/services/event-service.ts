import { IUser } from "./user-service";

const ERROR = {
  notFound: "Event not found",
  exceeded: "Event is fully booked",
  removeFirst:
    "Cannot update event's max capacity. Remove some participants first",
  notFoundParticipant: "Cannot remove non-existing participant",
  notFoundOwner: "Cannot create event without knowing the owner",
  alreadyRegistered: "You are already registered for that event",
};

export interface INewEvent {
  start: Date;
  title: string;
  capacity?: number | null; // null for unlimited
  participants?: IUser["id"][];
}

export interface IEvent extends INewEvent {
  id: string;
  ownerId: IUser["id"];
  capacity: Exclude<INewEvent["capacity"], undefined>;
  participants: Exclude<INewEvent["participants"], undefined>;
  status?: "canceled";
}

export interface IEventPublic {
  id: IEvent["id"];
  start: INewEvent["start"];
  title: INewEvent["title"];
}

class EventService {
  private events: IEvent[];

  constructor() {
    this.events = [];
  }

  static transformToPublic(event: IEvent): IEventPublic {
    return {
      id: event.id,
      start: event.start,
      title: event.title,
    };
  }

  async listOwned(ownerId: IEvent["ownerId"]) {
    return this.events
      .filter((event) => event.ownerId === ownerId)
      .map((event) => EventService.transformToPublic(event));
  }

  async listAvailable(userId: IUser["id"]): Promise<IEventPublic[]> {
    return this.events
      .filter((event) => !(event.participants ?? []).includes(userId))
      .filter((event) => event.status !== "canceled")
      .map((event) => EventService.transformToPublic(event));
  }

  async listMyParticipation(userId: IUser["id"]) {
    return this.events
      .filter((event) => event.participants?.includes(userId))
      .filter((event) => event.status !== "canceled")
      .map((event) => EventService.transformToPublic(event));
  }

  async create(ownerId: IEvent["ownerId"], event: INewEvent): Promise<IEvent> {
    if (!ownerId) {
      throw new Error(ERROR.notFoundOwner);
    }

    const toSave = {
      ...event,
      capacity: event.capacity ?? null,
      participants: event.participants ?? [],
      ownerId,
      id: crypto.randomUUID(),
    };

    this.events.push(toSave);

    return toSave;
  }

  async participate(
    userId: IUser["id"],
    eventId: IEvent["id"]
  ): Promise<boolean> {
    const event = this.events.find((e) => e.id === eventId);

    if (event === undefined) {
      throw new Error(ERROR.notFound);
    }

    if (
      event.capacity !== null &&
      event.capacity <= (event.participants?.length ?? 0)
    ) {
      throw new Error(ERROR.exceeded);
    }

    if (event.participants.includes(userId)) {
      throw new Error(ERROR.alreadyRegistered);
    }

    event.participants.push(userId);

    return true;
  }

  async getById(ownerId: IEvent["ownerId"], eventId: IEvent["id"]) {
    const found = this.events.find(
      (event) => event.id === eventId && event.ownerId === ownerId
    );

    if (!found) {
      throw new Error(ERROR.notFound);
    }

    return found;
  }

  async updateCapacity(
    ownerId: IEvent["ownerId"],
    eventId: IEvent["id"],
    capacity: number
  ): Promise<boolean> {
    const event = await this.getById(ownerId, eventId);

    if (event.participants.length > capacity) {
      throw new Error(ERROR.removeFirst);
    }

    event.capacity = capacity;

    return true;
  }

  async getEventParticipants(
    ownerId: IEvent["ownerId"],
    eventId: IEvent["id"]
  ): Promise<IEvent["participants"]> {
    const event = await this.getById(ownerId, eventId);

    return event.participants;
  }

  async updateParticipantsList(
    ownerId: IEvent["ownerId"],
    eventId: IEvent["id"],
    participants: IEvent["participants"]
  ): Promise<boolean> {
    const event = await this.getById(ownerId, eventId);

    if (event.capacity && participants.length > event.capacity) {
      throw new Error(ERROR.removeFirst);
    }

    event.participants = participants;

    return true;
  }

  async removeParticipant(
    ownerId: IEvent["ownerId"],
    eventId: IEvent["id"],
    userId: IUser["id"]
  ): Promise<boolean> {
    const event = await this.getById(ownerId, eventId);

    if (!event.participants.includes(userId)) {
      throw new Error(ERROR.notFoundParticipant);
    }

    const userIndex = event.participants.findIndex((id) => id === userId);

    event.participants.splice(userIndex, 1);

    return true;
  }

  async cancel(
    ownerId: IEvent["ownerId"],
    eventId: IEvent["id"]
  ): Promise<IUser["id"][]> {
    const event = await this.getById(ownerId, eventId);

    event.status = "canceled";

    return event.participants;
  }
}

export default EventService;
