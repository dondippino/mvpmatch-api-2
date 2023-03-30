import { Router } from "express";

import { create, getAllMazes, getMaze } from "../controllers/maze.controller";
import { verifyToken } from "../middlewares";

const router = Router();
router.post("/", verifyToken, create);
router.get("/:mazeId/solution", verifyToken, getMaze);
router.get("/", verifyToken, getAllMazes);
export const MazeRoutes = router;
