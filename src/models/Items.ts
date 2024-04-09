import mongoose, { Document, Schema } from "mongoose";

interface Review {
    userID: mongoose.Schema.Types.ObjectId | string;
    rating: number;
    comment: string;
}

interface ItemDoc extends Document {
    vendorID: mongoose.Schema.Types.ObjectId;
    itemName: string;
    itemDesc: string;
    itemPrice: number;
    itemStock: number;
    itemCategory: string;
    itemImages: string[];
    itemLikes: number;
    itemRatings: number;
    itemReviews: Review[];
}

const ItemSchema = new Schema<ItemDoc>(
    {
        vendorID: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors' },
        itemName: { type: String },
        itemDesc: { type: String },
        itemPrice: { type: Number },
        itemStock: { type: Number },
        itemCategory: { type: String },
        itemImages: { type: [String] },
        itemLikes: { type: Number, default: 0 },
        itemRatings: { type: Number, default: 0 },
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

export { ItemModel, ItemDoc };
