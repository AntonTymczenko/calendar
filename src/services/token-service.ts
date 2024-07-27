import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IUser } from "./user-service";

dotenv.config();

interface IAccessTokenPayload {
  userId: IUser["id"];
}

class TokenService {
  private readonly secret: string;

  constructor() {
    // TODO: use config service in constructor
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
      throw new Error("ACCESS_TOKEN_SECRET environmental variable is required");
    }

    this.secret = secret;
  }

  generateToken(
    payload: IAccessTokenPayload,
    expiresIn: string | number = "1w"
  ): string {
    return jwt.sign(payload, this.secret, { expiresIn });
  }

  verifyToken(token: string): IAccessTokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as IAccessTokenPayload;
      return decoded;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }
}

export default TokenService;
