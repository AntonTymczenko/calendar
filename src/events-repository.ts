export interface INewEvent {
  start: Date;
  title: string;
  capacity?: number | null;
  participants?: IUser["id"][];
}

export interface IEvent extends INewEvent {
  id: string;
  ownerId: IUser["id"];
  capacity: INewEvent["capacity"];
  participants: INewEvent["participants"];
}

class EventsService {
  private events: IEvent[];

  constructor() {
    this.events = [];
  }

  async listOwned(ownerId: IEvent["ownerId"]) {
    return this.events.filter((event) => event.ownerId === ownerId);
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

  async getById(ownerId: IEvent["ownerId"], eventId: IEvent["id"]) {
    const found = this.events.find(
      (event) => event.id === eventId && event.ownerId === ownerId
    );

    if (!found) {
      throw new Error("Event not found");
    }

    return found;
  }
}

export default EventsService;
