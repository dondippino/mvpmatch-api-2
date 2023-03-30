import { Request, Response, Router } from "express";
import { login } from "../controllers/auth.controller";

const router = Router();
router.get("/", (req: Request, res: Response) => {
  res.send({ message: "ok" });
});
router.post("/login", login);
export const AuthRoutes = router;
