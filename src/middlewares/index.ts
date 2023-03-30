import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token || !process.env.AUTH_PUBLIC_KEY) {
      return res.sendStatus(401);
    }

    const session = verify(token, process.env.AUTH_PUBLIC_KEY);

    if (typeof session === "string" || !session.exp) {
      return res.status(401).send({ message: "Invalid session" });
    }

    res.locals.session = session;
    const checkExpiry = Math.floor(Date.now() / 1000) - session.exp;
    if (checkExpiry >= 0) {
      return res.status(401).send({ message: "Expired token" });
    }

    next();
  } catch (error) {
    res.status(401).send();
  }
};
