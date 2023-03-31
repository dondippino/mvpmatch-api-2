import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { BadRequestError, BaseError, ServerError } from "../errors";
import { encryptPassword, isUserParamValid } from "../utils";

export const create = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    if (!isUserParamValid(body)) {
      return BadRequestError("Invalid input");
    }
    const encryptedPassword = await encryptPassword(body.password);
    const user = await prisma.user.create({
      data: {
        ...{ ...body, password: encryptedPassword },
      },
      select: {
        username: true,
      },
    });

    res.send(user);
  } catch (error) {
    if (error instanceof BaseError) {
      return res.status(error.status).send({
        message: error.message,
      });
    }
    ServerError(null, res);
  }
};
