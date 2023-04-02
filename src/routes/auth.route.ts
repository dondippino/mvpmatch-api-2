import { Request, Response, Router } from "express";
import { login } from "../controllers/auth.controller";

const router = Router();
router.get("/", (req: Request, res: Response) => {
  res.send({ description: "MVPMatch Maze API v1" });
});
router.post("/login", login);
export const AuthRoutes = router;
