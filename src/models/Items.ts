import mongoose, { Document, Model, Schema } from "mongoose";

//^ parang type safety ba, para magtugma dun sa schema
interface ItemDoc extends Document {
    vendorID: string;
    itemName: string;
    itemDesc: string;
    itemPrice: number;
    itemCategory: string;
    itemStock: number;
    itemImages: string[];
    itemLikes: number;
    itemRatings: number;
    itemReviews: [
        {
            userID: string;
            rating: number;
            comment: string;
        }
    ],
};

const ItemSchema = new Schema(
    {
        vendorID: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors' },
        itemName: { type: String },
        itemDesc: { type: String },
        itemPrice: { type: Number },
        itemStock: { type: Number },
        itemCategory: { type: String },
        itemImages: { type: [String], },
        itemLikes: { type: Number },
        itemRatings: { type: Number },
        itemReviews: [{
            userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            rating: { type: Number },
            comment: { type: String }
        }],
    },
    {
        timestamps: true
    }
);

const ItemModel = mongoose.model<ItemDoc>("items", ItemSchema);

export { ItemModel };
