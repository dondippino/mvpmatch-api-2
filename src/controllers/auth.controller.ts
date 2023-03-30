import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { comparePassord, createJwtToken, isUserParamValid } from "../utils";

export const login = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    if (!isUserParamValid(body)) {
      return res.status(400).send({ message: "Invalid entry" });
    }
    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const hasCorrectPassword = await comparePassord(
      body.password,
      user.password
    );
    if (!hasCorrectPassword) {
      return res.status(403).send({ message: "Incorrect login credentials" });
    }

    const access_token = createJwtToken({ username: body.username });
    res.send({
      access_token,
    });
  } catch (error) {
    return res.status(500).send();
  }
};
