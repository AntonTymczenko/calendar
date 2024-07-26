import TokenService from "./token-service";

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  accessToken: string;
}

class UserService {
  private users: IUser[];
  private readonly tokenService: TokenService;

  constructor(cryptoModule?: TokenService, userRepository?: IUser[]) {
    this.users = userRepository ?? [];
    this.tokenService = cryptoModule ?? new TokenService();
  }

  async register(userRequest: Pick<IUser, "fullName" | "email">) {
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
}

export default UserService;
