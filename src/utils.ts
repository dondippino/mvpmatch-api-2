import { compare, hash } from "bcrypt";
import { Response } from "express";
import { sign } from "jsonwebtoken";
import { BaseError } from "./errors";

export type UserParam = { username: string; password: string };
export type MazeParam = { gridSize: string; walls: string[]; entrance: string };
export type MinMax = "min" | "max";
type Session = { username: string; iat: number; exp: number };
export const isUserParamValid = (payload: unknown): payload is UserParam => {
  return (
    (payload as UserParam).username !== undefined &&
    (payload as UserParam).password !== undefined
  );
};

export const isPostMazeParamValid = (
  payload: unknown
): payload is MazeParam => {
  return (
    (payload as MazeParam).entrance !== undefined &&
    (payload as MazeParam).gridSize !== undefined &&
    (payload as MazeParam).walls !== undefined &&
    !(
      (payload as MazeParam).walls.filter((value) => !/^[A-Z]\d+$/.test(value))
        .length > 0
    ) &&
    /^[A-Z]\d+$/.test((payload as MazeParam).entrance) &&
    /^\d+x\d+$/.test((payload as MazeParam).gridSize)
  );
};

export const isMinMax = (value: unknown): value is MinMax => {
  return value === "min" || value === "max";
};

export const comparePassord = async (
  plainPassword: string,
  encryptedPassword: string
) => {
  const result = await compare(plainPassword, encryptedPassword);
  return result;
};

export const encryptPassword = async (plainPassword: string) => {
  const encypted = await hash(plainPassword, 10);
  return encypted;
};

export const createJwtToken = (payload: Pick<Session, "username">) => {
  const privateKey = process.env.AUTH_PRIVATE_KEY;
  return (
    privateKey &&
    sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1d",
    })
  );
};

export const isSession = (payload: unknown): payload is Session => {
  return (
    (payload as Session).username !== undefined &&
    (payload as Session).iat !== undefined &&
    (payload as Session).exp !== undefined
  );
};

export const handleError = (error: unknown, res: Response) => {
  if (error instanceof BaseError) {
    return res.status(error.status).send({
      message: error.message,
    });
  } else if (error instanceof Error) {
    return res.status(500).send({ message: error.message });
  }
  res.status(500).send({ message: "Server Error" });
};
