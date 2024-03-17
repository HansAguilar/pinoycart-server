import express from "express";
import { Authenticate } from "../middlewares";
import { HandlePayment } from "../controllers";

const router = express.Router();

// router.use(Authenticate);

router.post("/create-checkout-session", HandlePayment);


export { router as PaymentRoutes }