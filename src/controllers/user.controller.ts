import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { BadRequestError } from "../errors";
import { encryptPassword, handleError, isUserParamValid } from "../utils";

export const create = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    if (!isUserParamValid(body)) {
      throw new BadRequestError("Invalid input");
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
    handleError(error, res);
  }
};
