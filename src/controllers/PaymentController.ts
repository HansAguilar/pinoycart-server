const stripe = require('stripe')('sk_test_51NcUMUIuxrs7J8Gqpt7fxDjQ5A5WVWqFIHCDQsM3UrQokhVnAqFqtKYkJC8eMQEMvmTs8y0DnE18LGBoZzZj2o2700kCZfckm8');
import { NextFunction, Request, Response } from "express";
import { ItemModel, UserModel, VendorModel } from "../models";
import { HttpStatusCodes, isValidObjectId } from "../utility";

export const HandlePayment = async (req: Request, res: Response, next: NextFunction) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000, 
        currency: 'usd',
    });

    res.json({ clientSecret: paymentIntent.client_secret });
};