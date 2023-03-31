import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { UnauthorizedError } from "../errors";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token || !process.env.AUTH_PUBLIC_KEY) {
      UnauthorizedError("You are not authorized");
      return;
    }

    const session = verify(token, process.env.AUTH_PUBLIC_KEY);

    if (typeof session === "string" || !session.exp) {
      UnauthorizedError("Invalid session");
      return;
    }

    res.locals.session = session;
    const checkExpiry = Math.floor(Date.now() / 1000) - session.exp;
    if (checkExpiry >= 0) {
      UnauthorizedError("Expired token");
      return;
    }

    next();
  } catch (error) {
    UnauthorizedError("You are not authorized");
  }
};
