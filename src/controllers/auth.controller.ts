import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { BadRequestError, UnauthorizedError } from "../errors";
import {
  comparePassord,
  createJwtToken,
  handleError,
  isUserParamValid,
} from "../utils";

export const login = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    if (!isUserParamValid(body)) {
      throw new BadRequestError("Invalid entry");
    }
    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Incorrect login credentials");
    }

    const hasCorrectPassword = await comparePassord(
      body.password,
      user.password
    );
    if (!hasCorrectPassword) {
      throw new UnauthorizedError("Incorrect login credentials");
    }

    const access_token = createJwtToken({ username: body.username });
    res.send({
      access_token,
    });
  } catch (error) {
    handleError(error, res);
  }
};
