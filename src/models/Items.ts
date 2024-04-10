import mongoose, { Document, Schema } from "mongoose";

interface Review {
    userID: mongoose.Schema.Types.ObjectId | string;
    username: string;
    rating: number;
    likes?: number;
    isLiked?: boolean;
    comment: string;
    date?: Date; // Changed to Date type

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
    itemReviews: Review[];
}

//! PLAN B: DAPAT SEPARATE ANG REVIEWS COLLECTION KASI MAY SCNEARIO NA PAG NA LIKE YUNG COMMENT, NEED PA HANAPIN KANINONG COMMENT
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
        itemReviews: [{
            userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            username: { type: String },
            rating: { type: Number },
            likes: { type: Number, default: 0 },
            isLiked: { type: Boolean, default: false },
            comment: { type: String },
            date: { type: Date, default: Date.now } // Use Date.now as default value
        }],
    },
    {
        timestamps: true
    }
);

const ItemModel = mongoose.model<ItemDoc>("items", ItemSchema);

export { ItemModel, ItemDoc, Review };
