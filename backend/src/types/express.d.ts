import { RoleName } from "@prisma/client";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      role: RoleName;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};