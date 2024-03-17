require('dotenv').config();
const stripe = require('stripe')(process.env.ENV_STRIPE_API_KEY);
import { NextFunction, Request, Response } from "express";
import { HttpStatusCodes } from "../utility";

export const HandlePayment = async (req: Request, res: Response, next: NextFunction) => {
    const { products } = req.body;

    console.log(process.env)

    const lineItems = products.map((item) => ({
        price_data: {
            currency: "usd",
            product_data: {
                name: item.itemName,
                description: item.itemDesc
            },
            unit_amount: item.itemPrice * 56
        },
        quantity: item.itemStock
    }))

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "http://localhost:5173/success",
        cancel_url: "http://localhost:5173/cancel",
    })

    return res.status(HttpStatusCodes.OK).json({ id: session.id });
    // const paymentIntent = await stripe.paymentIntents.create({
    //     amount: 1000,
    //     currency: 'usd',
    // });

    // res.json({ clientSecret: paymentIntent.client_secret });
};