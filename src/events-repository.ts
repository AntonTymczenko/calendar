const ERROR = {
  notFound: "Event not found",
  exceeded: "Event is fully booked",
  removeFirst:
    "Cannot update event's max capacity. Remove some participants first",
};

export interface INewEvent {
  start: Date;
  title: string;
  capacity?: number | null;
  participants?: IUser["id"][];
}

export interface IEvent extends INewEvent {
  id: string;
  ownerId: IUser["id"];
  capacity: Exclude<INewEvent["capacity"], undefined>;
  participants: Exclude<INewEvent["participants"], undefined>;
}

export interface IEventPublic {
  id: IEvent["id"];
  start: INewEvent["start"];
  title: INewEvent["title"];
}

class EventsService {
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
      .map((event) => EventsService.transformToPublic(event));
  }

  async listAvailable(userId: IUser["id"]): Promise<IEventPublic[]> {
    return this.events
      .filter((event) => !(event.participants ?? []).includes(userId))
      .map((event) => EventsService.transformToPublic(event));
  }

  async listMyParticipation(userId: IUser["id"]) {
    return this.events
      .filter((event) => event.participants?.includes(userId))
      .map((event) => EventsService.transformToPublic(event));
  }

  async create(ownerId: IEvent["ownerId"], event: INewEvent) {
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

  async register(userId: IUser["id"], eventId: IEvent["id"]): Promise<boolean> {
    const event = this.events.find((e) => e.id === eventId);

    if (event === undefined) {
      throw new Error(ERROR.notFound + ` ${eventId}`);
    }

    if (
      event.capacity !== null &&
      event.capacity <= (event.participants?.length ?? 0)
    ) {
      throw new Error(ERROR.exceeded);
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
}

export default EventsService;
