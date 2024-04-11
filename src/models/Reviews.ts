import mongoose, { Document, Schema } from "mongoose";

interface Reviews extends Document {
    userID: mongoose.Schema.Types.ObjectId | string;
    itemID: mongoose.Schema.Types.ObjectId | string;
    rating: number;
    likes?: number;
    isLiked?: boolean;
    comment: string;
    date?: Date;
}

const ReviewSchema = new Schema<Reviews>(
    {
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Reference the User model
        itemID: { type: mongoose.Schema.Types.ObjectId, ref: 'items', required: true }, // Reference the User model
        rating: { type: Number, required: true },
        likes: { type: Number, default: 0 },
        isLiked: { type: Boolean, default: false },
        comment: { type: String, required: true },
        date: { type: Date, default: Date.now },
    },
    {
        timestamps: true
    }
);


const ReviewModel = mongoose.model<Reviews>("reviews", ReviewSchema);

export { ReviewModel, Reviews };
