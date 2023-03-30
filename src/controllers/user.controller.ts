import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { encryptPassword, isUserParamValid } from "../utils";

export const create = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    if (!isUserParamValid(body)) {
      return res.status(400).send();
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
    if (error instanceof Error) {
      res.status(500).send({
        message: error.message,
      });
    }
    res.status(500).send();
  }
};
