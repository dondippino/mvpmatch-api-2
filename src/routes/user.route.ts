import { Router } from "express";
import { create } from "../controllers/user.controller";

const router = Router();
router.post("/", create);
export const UserRoutes = router;
