import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { UnauthorizedError } from "../errors";
import { handleError } from "../utils";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token || !process.env.AUTH_PUBLIC_KEY) {
      throw new UnauthorizedError("You are not authorized");
    }

    const session = verify(token, process.env.AUTH_PUBLIC_KEY);

    if (typeof session === "string" || !session.exp) {
      throw new UnauthorizedError("Invalid session");
    }

    res.locals.session = session;
    const checkExpiry = Math.floor(Date.now() / 1000) - session.exp;
    if (checkExpiry >= 0) {
      throw new UnauthorizedError("Expired token");
    }

    next();
  } catch (error) {
    handleError(error, res);
  }
};
