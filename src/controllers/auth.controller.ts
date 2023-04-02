import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { BadRequestError, UnauthorizedError } from "../errors";
import {
  comparePassord,
  createJwtToken,
  handleError,
  isUserParamValid,
} from "../utils";

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { body } = req;

    // Validate the body of the request
    // to ensure it contains the right parameters
    if (!isUserParamValid(body)) {
      throw new BadRequestError("Invalid entry");
    }

    // Fetch user from the database
    const user = await prisma.user.findUnique({
      where: {
        username: body.username,
      },
    });

    // If user is not found throw an error
    if (!user) {
      throw new UnauthorizedError("Incorrect login credentials");
    }

    // Compare the hashed password with the plain password to authenticate user
    const hasCorrectPassword = await comparePassord(
      body.password,
      user.password
    );

    // If password is incorrect, throw an error
    if (!hasCorrectPassword) {
      throw new UnauthorizedError("Incorrect login credentials");
    }

    // On successful authentication create a token for the user
    const access_token = createJwtToken({ username: body.username });
    res.send({
      access_token,
    });
  } catch (error) {
    handleError(error, res);
  }
};
