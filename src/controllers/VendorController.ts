import { NextFunction, Request, Response } from "express";
import { ICreateVendor } from "../dto/Vendor.dto";
import { UserModel, VendorModel } from "../models";
import { HttpStatusCodes } from "../utility";


//^ CREATE VENDOR
export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {
    const { vendorName, vendorDesc } = <ICreateVendor>req.body;
    const user = req.user;

    try {
        const getUser = await UserModel.findById(user?._id);
        const isExistingVendor = await VendorModel.findOne({ vendorName: vendorName });

        if (getUser?.vendorInfo !== null) {
            return res.status(HttpStatusCodes.BadRequest).json({ message: "Sorry, you already have a shop" });
        }

        if (isExistingVendor) {
            return res.status(HttpStatusCodes.BadRequest).json({ message: "Name already exists." });
        }

        if (getUser) {
            const file = req.file;
            const createdVendor = await VendorModel.create({
                userID: getUser,
                vendorName: vendorName,
                vendorDesc: vendorDesc,
                vendorRatings: 0,
                vendorFollowers: 0,
                vendorBanner: file?.path,
                vendorFeedback: [],
                vendorItems: []
            });

            getUser.role = "vendor";
            getUser.vendorInfo = createdVendor.id;

            await getUser.save();
            return res.status(HttpStatusCodes.Created).json({ message: "You can now sell!" });
        }

        return res.status(HttpStatusCodes.NoContent).end(); // Return 204 with no response body
    }
    catch (error) {
        console.log(error);
        
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//^ UPDATE VENDOR INFO
export const UpdateVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user?._id;
        const { vendorName, vendorDesc } = <ICreateVendor>req.body;

        const existingVendor = await VendorModel.findOne({ userID: user });

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
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//^ UPDATE VENDOR BANNER
export const UpdateVendorBanner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user?._id;
        const existingVendor = await VendorModel.findOne({ userID: user });

        if (existingVendor) {
            const file = req.file;

            if (file) {
                existingVendor.vendorBanner = file!.path;

                await existingVendor.save();
                return res.status(HttpStatusCodes.OK).json({ message: "Vendor banner updated successfully" });
            }
            else {
                return res.status(HttpStatusCodes.BadRequest).json({ message: "No image file" })
            }
        }

        else {
            return res.status(HttpStatusCodes.Forbidden).json({ message: "You are not authorized!" })
        }
    }
    catch (error) {
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
    const { getVendorID } = req.body;
    try {
        const getVendors = await VendorModel.findById(getVendorID);

        if (getVendors) {
            return res.status(HttpStatusCodes.OK).json({ data: getVendors });
        }

        return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};