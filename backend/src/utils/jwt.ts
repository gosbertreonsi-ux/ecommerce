import jwt from "jsonwebtoken";

import { env } from "../config/env";
import type { RoleName } from "@prisma/client";

export interface UserPayload {
  id: number;
  role: RoleName;
}

export const generateToken = (
  payload: UserPayload,
): string => {
  return jwt.sign(
    payload,
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

export const verifyToken = (
  token: string,
): UserPayload => {
  const decoded = jwt.verify(
    token,
    env.JWT_SECRET,
  );

  if (
    typeof decoded === "string" ||
    typeof decoded.id !== "number" ||
    typeof decoded.role !== "string"
  ) {
    throw new Error(
      "Invalid token payload",
    );
  }

  if (
    decoded.role !== "ADMIN" &&
    decoded.role !== "CUSTOMER"
  ) {
    throw new Error(
      "Invalid user role",
    );
  }

  return {
    id: decoded.id,
    role: decoded.role as RoleName,
  };
};