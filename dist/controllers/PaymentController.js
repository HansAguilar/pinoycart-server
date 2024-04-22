"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Success = exports.HandlePayment = void 0;
require('dotenv').config();
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.ENV_STRIPE_API_KEY, { apiVersion: null });
const utility_1 = require("../utility");
const models_1 = require("../models");
const HandlePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const session = yield stripe.checkout.sessions.create({
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
        return res.status(utility_1.HttpStatusCodes.OK).json({
            message: 'Order placed successfully',
            session_id: session.id
        });
    }
    catch (error) {
        console.error('Error placing order:', error);
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: 'Error placing order' });
    }
});
exports.HandlePayment = HandlePayment;
//! TODO: TRANSFER THE CREATE ORDER HERE
const Success = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { session_id, userID } = req.body;
    if (!session_id)
        return res.status(utility_1.HttpStatusCodes.NotFound).json({ message: "Uh oh, something went wrong..." });
    try {
        // Check if there's an existing order with the same session ID
        const existingOrder = yield models_1.OrderModel.findOne({ session_id: session_id });
        let session;
        // If an order with the same session ID already exists, return a success response
        if (existingOrder) {
            return res.status(utility_1.HttpStatusCodes.OK).json({ message: "This payment was already processed" });
        }
        else {
            // Retrieve the session from Stripe
            try {
                session = yield stripe.checkout.sessions.retrieve(session_id, { expand: ['line_items'] });
            }
            catch (error) {
                console.error('Error retrieving session from Stripe:', error);
                return res.status(utility_1.HttpStatusCodes.NotFound).json({ message: "Uh oh, something went wrong..." });
            }
            // Check if session data is valid and payment is successful
            if (((_a = session.line_items) === null || _a === void 0 ? void 0 : _a.data) && ((_b = session.metadata) === null || _b === void 0 ? void 0 : _b.itemID) && session.payment_status === "paid") {
                // Process the order and create it in the database
                // Your order creation logic here
                const itemIDs = JSON.parse(session.metadata.itemID);
                const products = session.line_items.data;
                let totalAmount = products.reduce((total, product, index) => {
                    return total + (product.amount_total / 100) * product.quantity;
                }, 0);
                const user = yield models_1.UserModel.findById(userID);
                const itemsData = products.map((product, index) => ({
                    itemID: itemIDs[index],
                    quantity: product.quantity,
                    price: product.amount_total / 100
                }));
                const order = yield models_1.OrderModel.create({
                    customerID: userID,
                    items: itemsData,
                    address: "Philippines",
                    session_id: session_id,
                    totalAmount: totalAmount,
                    orderStatus: 'delivered'
                });
                itemIDs.map((itemID) => {
                    if (!user.orders.includes(itemID)) {
                        user.orders.push(itemID);
                    }
                });
                yield user.save();
                for (const [index, product] of products.entries()) {
                    const itemID = itemIDs[index];
                    const getItem = yield models_1.ItemModel.findById(itemID);
                    if (getItem) {
                        getItem.itemStock -= product.quantity;
                        yield getItem.save();
                    }
                }
                return res.status(utility_1.HttpStatusCodes.OK).json({ message: "Payment Successful", cache: true });
            }
        }
        // If payment is unpaid, return unsuccessful response
        if (session.payment_status === 'unpaid') {
            console.log("Payment unsuccessful");
            return res.status(utility_1.HttpStatusCodes.OK).json({ message: "Payment unsuccessful" });
        }
    }
    catch (error) {
        console.error('Error processing payment:', error);
        return res.status(utility_1.HttpStatusCodes.BadRequest).json({ message: "Error processing payment" });
    }
});
exports.Success = Success;
//# sourceMappingURL=PaymentController.js.map