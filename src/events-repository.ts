export interface INewEvent {
  start: Date;
  title: string;
  capacity?: number | null;
  participants?: IUser[];
}

export interface IEvent extends INewEvent {
  id: string;
  ownerId: IUser["id"];
  capacity: number | null;
  participants: IUser[];
}

class EventsRepository {
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
}

export default EventsRepository;
