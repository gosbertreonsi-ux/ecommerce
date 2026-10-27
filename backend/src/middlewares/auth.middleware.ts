import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  verifyToken,
  type UserPayload,
} from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const parts =
      authorization.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization header",
      });
    }

    const token = parts[1];

    req.user =
      verifyToken(token);

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
};