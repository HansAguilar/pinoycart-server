import { NextFunction, Request, Response } from "express";
import { ICreateVendor } from "../dto/Vendor.dto";
import { ItemModel, UserModel, VendorModel } from "../models";
import { HttpStatusCodes } from "../utility";
import cloudinary from "../services/Cloudinary";


//^ CREATE VENDOR
export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {
    const { vendorName, vendorDesc, userID } = req.body;

    try {
        const getUser = await UserModel.findById(userID);
        const isExistingVendor = await VendorModel.findOne({ vendorName: vendorName });

        if (getUser.role === "vendor") {
            return res.status(HttpStatusCodes.BadRequest).json({ message: "Sorry, you already have a shop" });
        }

        if (isExistingVendor) {
            return res.status(HttpStatusCodes.OK).json({ message: "Name already exists." });
        }

        if (getUser) {
            const file = req.file;
            const createdVendor = await VendorModel.create({
                userID: getUser,
                vendorName: vendorName,
                vendorDesc: vendorDesc,
                vendorRatings: 0,
                vendorFollowers: 0,
                vendorBanner: file?.filename,
                vendorFeedback: [],
                vendorItems: []
            });

            getUser.role = "vendor";
            getUser.vendorInfo = createdVendor.id;

            await getUser.save();

            return res.status(HttpStatusCodes.Created).json({ message: "You can now sell!" });
        }

        return res.status(HttpStatusCodes.NoContent).end();
    }
    catch (error) {
        console.log(error.message);
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};


//^ UPDATE VENDOR INFO
export const UpdateVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { vendorID, vendorName, vendorDesc } = <ICreateVendor>req.body;

        const existingVendor = await VendorModel.findOne({ _id: vendorID });

        if (existingVendor) {
            existingVendor.vendorName = vendorName;
            existingVendor.vendorDesc = vendorDesc;

            existingVendor.save();
            return res.status(HttpStatusCodes.OK).json({ message: "Vendor Successfully Updated!" });
        }
        else {
            return res.status(HttpStatusCodes.NoContent).end(); // Return 204 with no response body
        }
    }
    catch (error) {
        console.log(error);
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};


//^ UPDATE VENDOR BANNER
export const UpdateVendorBanner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { vendorID } = req.body;
        console.log("oh bakit", req.file)
        console.log(vendorID)

        return res.status(HttpStatusCodes.BadRequest).json({ message: "No image file provided" });

        const existingVendor = await VendorModel.findOne({ _id: vendorID });

        if (!existingVendor) {
            return res.status(HttpStatusCodes.Forbidden).json({ message: "You are not authorized!" });
        }

        const file = req.file;

        if (!file) {
            return res.status(HttpStatusCodes.BadRequest).json({ message: "No image file provided" });
        }

        // Check if the uploaded file is an image
        if (!file.mimetype.startsWith('image')) {
            return res.status(HttpStatusCodes.BadRequest).json({ message: "Invalid image file format" });
        }

        // Upload the file buffer to Cloudinary
        const result = await cloudinary.uploader.upload(file.filename, {
            public_id: `vendor_${existingVendor.vendorName}_${Date.now()}` // Unique public ID for the uploaded image
        });

        // Update the vendor's banner URL in the database with the Cloudinary URL
        existingVendor.vendorBanner = result.secure_url;

        // Save the changes to the database
        await existingVendor.save();

        // Optionally, delete the previous banner file from the local server if needed

        return res.status(HttpStatusCodes.OK).json({ message: "Vendor banner updated successfully", imageUrl: result.secure_url });
    }
    catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};


//^ GET ALL VENDORS
export const GetAllVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const getVendors = await VendorModel.find({}, '-password -__v -createdAt -updatedAt');

        if (getVendors.length > 0) {
            return res.status(HttpStatusCodes.OK).json({ data: getVendors });
        }

        return res.status(HttpStatusCodes.NoContent).end(); // Return 204 with no response body
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//^ GET VENDOR BY ID
export const GetVendorById = async (req: Request, res: Response, next: NextFunction) => {
    const { vendorID } = req.body;
    try {
        const getVendors = await VendorModel.findById(vendorID);
        let getItems = [];

        if (getVendors) {
            getItems = await Promise.all(
                getVendors.vendorItems.map(async (item) => {
                    return await ItemModel.findById(item);
                })
            );

            return res.status(HttpStatusCodes.OK).json({ data: getVendors, vendorItems: getItems });
        }

        return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};