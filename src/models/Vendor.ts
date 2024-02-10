import mongoose, { Document, Model, Schema } from "mongoose";


//^ parang type safety ba, para magtugma dun sa schema
interface VendorDoc extends Document {
    userID: string,
    vendorName: string,
    vendorDesc: string,
    vendorBanner: string | null,
    vendorFollowers: number,
    vendorRatings: number,
    vendorFeedback: string[],
    vendorItems: string[]
};

const VendorSchema = new Schema(
    {
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        vendorName: { type: String, required: true, unique: true },
        vendorDesc: { type: String, required: true },
        vendorBanner: { type: String, },
        vendorFollowers: { type: Number },
        vendorRatings: { type: Number },
        vendorFeedback: { type: [String] },
        vendorItems: {
            type: [String],
            ref: 'items',
            default: [],
        },
    },
    {
        timestamps: true
    }
);

const VendorModel = mongoose.model<VendorDoc>("vendors", VendorSchema);

export { VendorModel };