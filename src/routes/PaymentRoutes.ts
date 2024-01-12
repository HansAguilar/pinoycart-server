import express from "express";
import { Authenticate } from "../middlewares";
import { HandlePayment } from "../controllers";

const router = express.Router();

router.use(Authenticate);

router.post("/create-payment-intent", HandlePayment);


export { router as PaymentRoutes }