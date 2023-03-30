import { Maze } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { isMinMax, isPostMazeParamValid, isSession } from "../utils";

export const create = async (req: Request, res: Response) => {
  try {
    const session = res.locals.session;
    if (isSession(session)) {
      const { body } = req;
      if (!isPostMazeParamValid(body)) {
        return res.status(400).send({ message: "Invalid input" });
      }

      const maze = await prisma.maze.create({
        data: {
          ...body,
          owner: {
            connect: {
              username: session.username,
            },
          },
        },
      });

      res.send(maze);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send({
        message: error.message,
      });
    }
    res.status(500).send();
  }
};

export const getMaze = async (req: Request, res: Response) => {
  try {
    const { params, query } = req;
    const { mazeId } = params;
    const { steps } = query;

    if (!isMinMax(steps) || isNaN(parseInt(mazeId))) {
      return res.status(400).send({ message: "Invalid input" });
    }

    const maze = await prisma.maze.findUnique({
      where: {
        id: parseInt(mazeId),
      },
    });

    if (!maze) {
      return res.status(404).send();
    }

    const paths = await solution(maze);

    res.send({ path: paths[steps] });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send({
        message: error.message,
      });
    }
    res.status(500).send();
  }
};

export const getAllMazes = async (req: Request, res: Response) => {
  try {
    const session = res.locals.session;
    if (isSession(session)) {
      const mazes = await prisma.maze.findMany({
        where: {
          owner: {
            is: {
              username: session.username,
            },
          },
        },
      });

      res.send(mazes);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send({
        message: error.message,
      });
    }
    res.status(500).send();
  }
};

export const solution = async (maze: Maze) => {
  const { entrance, gridSize, walls: wallsArray } = maze;

  const rowAndColumn = gridSize.split("x").map((v) => parseInt(v));

  if (!Array.isArray(wallsArray)) {
    throw new Error();
  }
  const rows = rowAndColumn[0];
  const columns = rowAndColumn[1];

  const walls = new Set(wallsArray);

  const x = parseInt(entrance.slice(1)) - 1;
  const y = entrance.slice(0, 1).charCodeAt(0) - 65;

  if (x < 0 || x >= rows || y < 0 || x >= columns) {
    throw new Error("Maze has no solution");
  }

  const grid: [number, number, number, [number, number][]][][] = [];
  for (let i = 0; i < rows; i++) {
    let line: [number, number, number, [number, number][]][] = [];
    for (let j = 0; j < columns; j++) {
      const value: [number, number, number, [number, number][]] = [
        i,
        j,
        walls.has(`${String.fromCharCode(65 + j)}${i + 1}`) ? 1 : 0,
        [],
      ];
      line.push(value);
    }
    grid.push(line);
  }

  let stack: [number, number, number, [number, number][]][] = [grid[x][y]];
  let visited: Set<string> = new Set();
  let paths: number[][][] = [];

  while (stack.length > 0) {
    const e = stack.shift();
    if (!e) break;

    const r = e[0];
    const c = e[1];

    const key = `${r}|${c}`;
    visited.add(key);

    // up
    if (
      r - 1 >= 0 &&
      grid[r - 1][c][2] === 0 &&
      !visited.has(`${r - 1}|${c}`)
    ) {
      grid[r - 1][c][3] = [...e[3], [e[0], e[1]]];
      stack.push(grid[r - 1][c]);
    }

    // right
    if (
      c + 1 < columns &&
      grid[r][c + 1][2] === 0 &&
      !visited.has(`${r}|${c + 1}`)
    ) {
      grid[r][c + 1][3] = [...e[3], [e[0], e[1]]];
      stack.push(grid[r][c + 1]);
    }

    // down
    if (
      r + 1 < rows &&
      grid[r + 1][c][2] === 0 &&
      !visited.has(`${r + 1}|${c}`)
    ) {
      grid[r + 1][c][3] = [...e[3], [e[0], e[1]]];
      stack.push(grid[r + 1][c]);
    } else if (r === rows - 1) {
      paths.push([...e[3], [e[0], e[1]]]);
    }

    // left
    if (
      c - 1 >= 0 &&
      grid[r][c - 1][2] === 0 &&
      !visited.has(`${r}|${c - 1}`)
    ) {
      grid[r][c - 1][3] = [...e[3], [e[0], e[1]]];
      stack.push(grid[r][c - 1]);
    }
  }

  const min = [Number.MAX_VALUE, -1];
  const max = [Number.MIN_VALUE, -1];

  if (!paths || paths.length === 0) {
    throw new Error("Maze has no solution");
  }

  paths.forEach((path, index) => {
    if (path.length < min[0]) {
      min[0] = path.length;
      min[1] = index;
    }
    if (path.length > max[0]) {
      max[0] = path.length;
      max[1] = index;
    }
  });

  const formatResult = (p: number[][]) => {
    return p.map((v) => `${String.fromCharCode(64 + v[1] + 1)}${v[0] + 1}`);
  };
  let result = {
    min: formatResult(paths[min[1]]),
    max: formatResult(paths[max[1]]),
  };
  return result;
};
