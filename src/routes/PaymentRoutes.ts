import express from "express";
import { Authenticate } from "../middlewares";
import { HandlePayment, Success } from "../controllers";

const router = express.Router();

// router.use(Authenticate);

router.post("/create-checkout-session", HandlePayment);
router.post("/success", Success);


export { router as PaymentRoutes }