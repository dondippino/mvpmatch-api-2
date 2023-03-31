import { Request, Response } from "express";
import { prisma } from "../../prisma";
import {
  BadRequestError,
  BaseError,
  NoAceessError,
  NotFoundError,
  ServerError,
} from "../errors";
import { comparePassord, createJwtToken, isUserParamValid } from "../utils";

export const login = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    if (!isUserParamValid(body)) {
      BadRequestError("Invalid entry");
    }
    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!user) {
      NotFoundError("User not found");
    }

    const hasCorrectPassword = await comparePassord(
      body.password,
      user.password
    );
    if (!hasCorrectPassword) {
      NoAceessError("Incorrect login credentials");
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
