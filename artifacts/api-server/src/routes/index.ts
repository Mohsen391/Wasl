import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mediaRouter from "./media";
import ordersRouter from "./orders";
import authRouter from "./auth";
import productsRouter from "./products";
import giftsRouter from "./gifts";

const router: IRouter = Router();
router.use(healthRouter);
router.use(mediaRouter);
router.use(ordersRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(giftsRouter);
export default router;
