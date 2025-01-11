import { Router } from "express";

import leadRoutes from "./leads";
import homeRoutes from "./home";
import authRoutes from "./auth";
import { authenticateToken } from "../helpers/authMiddleware";

const router: Router = Router();

router.use("/", homeRoutes);
router.use("/auth", authRoutes);
router.use("/leads", authenticateToken, leadRoutes);

export default router;
