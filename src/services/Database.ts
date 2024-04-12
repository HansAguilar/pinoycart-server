import mongoose from "mongoose";
import { MONGO_URI } from "../config";

export default async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGO DB CONNECTED");
    }
    catch (error) {
        console.log(error);
    }
};
