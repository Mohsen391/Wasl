import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mediaRouter from "./media";
import ordersRouter from "./orders";

const router: IRouter = Router();
router.use(healthRouter);
router.use(mediaRouter);
router.use(ordersRouter);
export default router;
