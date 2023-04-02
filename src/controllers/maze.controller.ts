import { Maze } from "@prisma/client";
import { Request, Response } from "express";
import { prisma } from "../../prisma";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
} from "../errors";
import {
  handleError,
  isMinMax,
  isPostMazeParamValid,
  isSession,
} from "../utils";

// Create a Maze
export const create = async (req: Request, res: Response) => {
  try {
    // Fetch the session
    const session = res.locals.session;

    // If session is valid
    if (isSession(session)) {
      const { body } = req;

      // Validate the bosy of the request
      if (!isPostMazeParamValid(body)) {
        throw new BadRequestError("Invalid input");
      }

      // Create maze in the database
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

      return res.send(maze);
    }
    throw new UnauthorizedError("Invalid session");
  } catch (error) {
    handleError(error, res);
  }
};

// Get solution to maze
export const getMazeSolution = async (req: Request, res: Response) => {
  try {
    const { params, query } = req;
    const { mazeId } = params;
    const { steps } = query;

    // Validate the parameters and the query strings
    if (!isMinMax(steps) || isNaN(parseInt(mazeId))) {
      throw new BadRequestError("Invalid input");
    }

    // Fetch maze from the database
    const maze = await prisma.maze.findUnique({
      where: {
        id: parseInt(mazeId),
      },
    });

    // If maze is nt found, throw error
    if (!maze) {
      throw new NotFoundError("maze not found");
    }

    // Solve the maze and get the shortest and longest paths
    const paths = await solution(maze);

    res.send({ path: paths[steps] });
  } catch (error) {
    handleError(error, res);
  }
};

// Get list of mazes
export const getAllMazes = async (req: Request, res: Response) => {
  try {
    // Fetch session
    const session = res.locals.session;

    // If session is valid
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

      return res.send(mazes);
    }
    throw new UnauthorizedError("Invalid session");
  } catch (error) {
    handleError(error, res);
  }
};

// Solution to the maze using Breadth First Search algorithm
// using iterative approach
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
    throw new ServerError("Maze has no solution");
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
    throw new ServerError("Maze has no solution");
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
