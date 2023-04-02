import { Router } from "express";

import {
  create,
  getAllMazes,
  getMazeSolution,
} from "../controllers/maze.controller";
import { verifyToken } from "../middlewares";

const router = Router();
router.post("/", verifyToken, create);
router.get("/:mazeId/solution", verifyToken, getMazeSolution);
router.get("/", verifyToken, getAllMazes);
export const MazeRoutes = router;
