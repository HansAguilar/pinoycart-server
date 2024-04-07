import mongoose, { Document, Model, Schema } from "mongoose";


//^ parang type safety ba, para magtugma dun sa schema
interface OrderDoc extends Document {
    customerID: string;
    items: {
        itemID: string;
        itemQuantity: number;
        itemPrice: number
    }[];
    session_id: string
    address: string;
    totalAmount: number;
    orderStatus: string;
};

//^ tas ito yung parang table sa SQL :)
const OrderSchema = new Schema(
    {
        customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        items: [
            {
                itemID: { type: mongoose.Schema.Types.ObjectId, ref: 'items', required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            }
        ],
        session_id: { type: String, required: true },
        address: { type: String, required: true },
        totalAmount: { type: Number, required: true },
        orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered'], default: 'pending' },
    },
    {
        timestamps: true
    }
);

const OrderModel = mongoose.model<OrderDoc>("orders", OrderSchema); //^ (String: name of table, Object: fields ng table)

export { OrderModel };