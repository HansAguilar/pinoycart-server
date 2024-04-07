require('dotenv').config();
import Stripe from 'stripe';
const stripe = new Stripe(process.env.ENV_STRIPE_API_KEY, { apiVersion: null });
import { NextFunction, Request, Response } from "express";
import { HttpStatusCodes } from "../utility";
import { ItemModel, OrderModel, UserModel } from '../models';

export const HandlePayment = async (req: Request, res: Response, next: NextFunction) => {
    const { products } = req.body;

    const lineItems = products.map((item) => {
        const adjustedPrice = item.itemPrice * 100; // Adjust the price

        return {
            price_data: {
                currency: "php",
                product_data: {
                    name: item.itemName,
                },
                unit_amount: adjustedPrice
            },
            quantity: item.itemStock,
        };
    });

    let productIds = products.map(item => item._id);

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            currency: "php",
            success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: "http://localhost:5173/cancel",
            expires_at: Math.floor(Date.now() / 1000) + 1800,
            metadata: {
                itemID: JSON.stringify(productIds) // Store the array of product IDs as a JSON string
            },
        });

        return res.status(HttpStatusCodes.OK).json({
            message: 'Order placed successfully',
            session_id: session.id
        });
    } catch (error) {
        console.error('Error placing order:', error);
        return res.status(HttpStatusCodes.InternalServerError).json({ message: 'Error placing order' });
    }
};



//! TODO: TRANSFER THE CREATE ORDER HERE
export const Success = async (req: Request, res: Response, next: NextFunction) => {
    const { session_id, userID } = req.body;

    if (!session_id) return res.status(HttpStatusCodes.NotFound).json({ message: "Uh oh, something went wrong..." });

    try {
        const existingOrder = await OrderModel.findOne({ session_id: session_id });

        if (existingOrder) return res.status(HttpStatusCodes.OK).json({ message: "This payment was already processed" });

        let session;
        try {
            session = await stripe.checkout.sessions.retrieve(session_id as string, { expand: ['line_items'] });

            console.log("session1", session)
        }
        catch (error) {
            console.log("session2", session)
            console.error('Error retrieving session from Stripe:', error);
            return res.status(HttpStatusCodes.NotFound).json({ message: "Uh oh, something went wrong..." });
        }

        if (session.line_items?.data && session.metadata?.itemID && session.payment_status != "unpaid") {
            const itemIDs = JSON.parse(session.metadata.itemID);
            const products = session.line_items.data;

            let totalAmount = products.reduce((total, product: any, index) => {
                return total + (product.amount_total / 100) * product.quantity;
            }, 0);

            const itemsData = products.map((product: any, index: number) => ({
                itemID: itemIDs[index],
                quantity: product.quantity,
                price: product.amount_total / 100
            }));

            const order = await OrderModel.create({
                customerID: userID,
                items: itemsData,
                address: "Philippines",
                session_id: session_id,
                totalAmount: totalAmount,
                orderStatus: 'delivered'
            });

            const user = await UserModel.findById(userID);
            user.orders.push(order._id);
            await user.save();

            for (const [index, product] of products.entries()) {
                const itemID = itemIDs[index];
                const getItem = await ItemModel.findById(itemID);
                if (getItem) {
                    getItem.itemStock -= product.quantity;
                    await getItem.save();
                }
            }



            return res.status(HttpStatusCodes.OK).json({ message: "Payment Successful", cache: true });
        }

        if (session.payment_status === 'unpaid') {
            console.log("Payment unsuccessful");
            return res.status(HttpStatusCodes.OK).json({ message: "Payment unsuccessful" });
        }
    }
    catch (error) {
        console.error('Error processing payment:', error);
        return res.status(HttpStatusCodes.BadRequest).json({ message: "Error processing payment" });
    }
};
