import mongoose, { Document, Model, Schema } from "mongoose";

//^ parang type safety ba, para magtugma dun sa schema
interface ItemDoc extends Document {
    vendorID: string,
    itemName: string,
    itemDesc: string,
    itemPrice: number,
    itemCategory: [string],
    itemQuantity: number,
    itemImages: [string],
    itemLikes: number,
    itemRatings: number,
    itemReviews: [string],
};

const ItemSchema = new Schema(
    {
        vendorID: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors' },
        itemName: { type: String, required: true },
        itemDesc: { type: String, required: true },
        itemPrice: { type: Number, required: true },
        itemQuantity: { type: Number },
        itemCategory: { type: [String] },
        itemImages: { type: [String], },
        itemLikes: { type: Number },
        itemRatings: { type: Number },
        itemReviews: { type: [String] },
    },
    {
        timestamps: true
    }
);

const ItemModel = mongoose.model<ItemDoc>("items", ItemSchema);

export { ItemModel };
