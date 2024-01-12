import mongoose, { Document, Model, Schema } from "mongoose";

interface Vendor {
    userID: string,
    vendorName: string,
    vendorDesc: string,
    vendorFeedback: [string],
};

//^ parang type safety ba, para magtugma dun sa schema
interface UserDoc extends Document {
    username: string,
    password: string,
    email: string,
    phone: string,
    // address: {
    //     city: string,
    //     street: string,
    //     postal: string
    // },
    cart: [
        {
            itemID: string,
            itemQuantity: number
        }
    ],
    role: string,
    orders: [string],
    followed: [string],
    vendorInfo: Vendor | null
};

//^ tas ito yung parang table sa SQL :)
const UserSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true, unique: true },
        // address: {
        //     city: { type: String },
        //     street: { type: String },
        //     postal: { type: String }
        // },
        cart: [
            {
                itemID: { type: String },
                itemQuantity: { type: Number }
            }
        ],
        role: { type: String, required: true, default: "customer" },
        orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'orders' }],
        followed: { type: [String] },
        vendorInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors' }
    },
    {
        timestamps: true
    }
);

const UserModel = mongoose.model<UserDoc>("users", UserSchema); //^ (String: name of table, Object: fields ng table)

export { UserModel };