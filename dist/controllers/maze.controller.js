"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solution = exports.getAllMazes = exports.getMaze = exports.create = void 0;
const prisma_1 = require("../../prisma");
const utils_1 = require("../utils");
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = res.locals.session;
        if (utils_1.isSession(session)) {
            const { body } = req;
            if (!utils_1.isPostMazeParamValid(body)) {
                return res.status(400).send({ message: "Invalid input" });
            }
            const maze = yield prisma_1.prisma.maze.create({
                data: Object.assign(Object.assign({}, body), { owner: {
                        connect: {
                            username: session.username,
                        },
                    } }),
            });
            res.send(maze);
        }
    }
    catch (error) { }
});
exports.create = create;
const getMaze = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { params, query } = req;
        const { mazeId } = params;
        const { steps } = query;
        if (!utils_1.isMinMax(steps) || isNaN(parseInt(mazeId))) {
            return res.status(400).send({ message: "Invalid input" });
        }
        const maze = yield prisma_1.prisma.maze.findUnique({
            where: {
                id: parseInt(mazeId),
            },
        });
        if (!maze) {
            return res.status(404).send();
        }
        const paths = yield exports.solution(maze);
        res.send({ path: paths[steps] });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).send({
                message: error.message,
            });
        }
        res.status(500).send();
    }
});
exports.getMaze = getMaze;
const getAllMazes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = res.locals.session;
        if (utils_1.isSession(session)) {
            const mazes = yield prisma_1.prisma.maze.findMany({
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
    }
    catch (error) { }
});
exports.getAllMazes = getAllMazes;
const solution = (maze) => __awaiter(void 0, void 0, void 0, function* () {
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
    const grid = [];
    for (let i = 0; i < rows; i++) {
        let line = [];
        for (let j = 0; j < columns; j++) {
            const value = [
                i,
                j,
                walls.has(`${String.fromCharCode(65 + j)}${i + 1}`) ? 1 : 0,
                [],
            ];
            line.push(value);
        }
        grid.push(line);
    }
    let stack = [grid[x][y]];
    let visited = new Set();
    let paths = [];
    while (stack.length > 0) {
        const e = stack.shift();
        if (!e)
            break;
        const r = e[0];
        const c = e[1];
        const key = `${r}|${c}`;
        visited.add(key);
        // up
        if (r - 1 >= 0 &&
            grid[r - 1][c][2] === 0 &&
            !visited.has(`${r - 1}|${c}`)) {
            grid[r - 1][c][3] = [...e[3], [e[0], e[1]]];
            stack.push(grid[r - 1][c]);
        }
        // right
        if (c + 1 < columns &&
            grid[r][c + 1][2] === 0 &&
            !visited.has(`${r}|${c + 1}`)) {
            grid[r][c + 1][3] = [...e[3], [e[0], e[1]]];
            stack.push(grid[r][c + 1]);
        }
        // down
        if (r + 1 < rows &&
            grid[r + 1][c][2] === 0 &&
            !visited.has(`${r + 1}|${c}`)) {
            grid[r + 1][c][3] = [...e[3], [e[0], e[1]]];
            stack.push(grid[r + 1][c]);
        }
        else if (r === rows - 1) {
            paths.push([...e[3], [e[0], e[1]]]);
        }
        // left
        if (c - 1 >= 0 &&
            grid[r][c - 1][2] === 0 &&
            !visited.has(`${r}|${c - 1}`)) {
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
    const formatResult = (p) => {
        return p.map((v) => `${String.fromCharCode(64 + v[1] + 1)}${v[0] + 1}`);
    };
    let result = {
        min: formatResult(paths[min[1]]),
        max: formatResult(paths[max[1]]),
    };
    return result;
});
exports.solution = solution;
