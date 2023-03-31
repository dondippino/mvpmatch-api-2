import { Request, Response } from "express";
import { prisma } from "../../prisma";
import {
  BadRequestError,
  BaseError,
  ServerError,
  UnauthorizedError,
} from "../errors";
import { comparePassord, createJwtToken, isUserParamValid } from "../utils";

export const login = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    if (!isUserParamValid(body)) {
      BadRequestError("Invalid entry");
      return;
    }
    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!user) {
      UnauthorizedError("Incorrect login credentials");
      return;
    }

    const hasCorrectPassword = await comparePassord(
      body.password,
      user.password
    );
    if (!hasCorrectPassword) {
      UnauthorizedError("Incorrect login credentials");
      return;
    }

    const access_token = createJwtToken({ username: body.username });
    res.send({
      access_token,
    });
  } catch (error) {
    if (error instanceof BaseError) {
      return res.status(error.status).send({
        message: error.message,
      });
    }
    ServerError(null, res);
  }
};
