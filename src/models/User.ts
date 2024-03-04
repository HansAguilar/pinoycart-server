import mongoose, { Document, Model, Schema } from "mongoose";

interface Vendor {
    userID: string;
    vendorName: string;
    vendorDesc: string;
    vendorFeedback: string[];
};

//^ parang type safety ba, para magtugma dun sa schema
interface UserDoc extends Document {
    username: string;
    password: string;
    cart: [
        {
            itemID: string;
            itemQuantity: number
        }
    ];
    role: string;
    orders: string[];
    followed: string[];
    vendorInfo: Vendor | undefined
};

//^ tas ito yung parang table sa SQL :)
const UserSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
        cart: [
            {
                itemID: { type: String },
                itemQuantity: { type: Number }
            }
        ],
        role: { type: String, required: true, default: "customer" },
        orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'orders' }],
        followed: { type: [String] },
        vendorInfo: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors', default: undefined }
    },
    {
        timestamps: true
    }
);

const UserModel = mongoose.model<UserDoc>("users", UserSchema); //^ (String: name of table, Object: fields ng table)

export { UserModel };