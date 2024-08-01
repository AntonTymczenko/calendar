import TokenService from "./token-service";

export interface IUserPublic {
  id: string;
  fullName: string;
}

export interface IUser extends IUserPublic {
  email: string;
  accessToken: string;
}

export interface IRegisteredUser {
  userId: IUser["id"];
  accessToken: IUser["accessToken"];
}

class UserService {
  private users: IUser[];
  private readonly tokenService: TokenService;

  constructor(cryptoModule?: TokenService, userRepository?: IUser[]) {
    this.users = userRepository ?? [];
    this.tokenService = cryptoModule ?? new TokenService();
  }

  static transformToPublic(user: IUser): IUserPublic {
    return {
      id: user.id,
      fullName: user.fullName,
    };
  }

  async register(
    userRequest: Pick<IUser, "fullName" | "email">
  ): Promise<IRegisteredUser> {
    const { fullName, email } = userRequest;
    // TODO: check if email is unique

    const userId = crypto.randomUUID();
    const accessToken = this.tokenService.generateToken({ userId });

    const user: IUser = {
      id: userId,
      fullName,
      email,
      accessToken,
    };

    this.users.push(user);

    return { userId, accessToken };
  }

  async authenticate(token: string): Promise<IUser | null> {
    try {
      const payload = this.tokenService.verifyToken(token);

      if (!payload?.userId) {
        return null;
      }

      const found = this.users.find((user) => payload.userId === user.id);

      return found ?? null;
    } catch (error) {
      console.error(error);
    }

    return null;
  }

  async list(userIds: IUser["id"][]): Promise<IUserPublic[]> {
    const users = this.users.filter((user) => userIds.includes(user.id));

    return users.map(UserService.transformToPublic);
  }

  async getById(userId: IUser["id"]): Promise<IUser> {
    const user = this.users.find((u) => u.id === userId);

    if (!user) {
      throw new Error("No user found");
    }

    return user;
  }
}

export default UserService;
