import mongoose, { Document, Schema } from "mongoose";

interface Review extends Document {
    userID: mongoose.Schema.Types.ObjectId | string;
    username: string;
    rating: number;
    likes?: number;
    isLiked?: boolean;
    comment: string;
    date?: Date;
}

interface ItemDoc extends Document {
    vendorID: mongoose.Schema.Types.ObjectId;
    itemName: string;
    itemDesc: string;
    itemPrice: number;
    itemStock: number;
    itemCategory: string;
    itemImages: string[];
    itemRatings: number;
    itemReviews: mongoose.Schema.Types.ObjectId[];  // Changed to array of ObjectIds
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
        itemRatings: { type: Number, default: 0 },
        itemReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'reviews' }], // Array of ObjectIds referencing reviews collection
    },
    {
        timestamps: true
    }
);

const ItemModel = mongoose.model<ItemDoc>("items", ItemSchema);

export { ItemModel, ItemDoc, Review };
