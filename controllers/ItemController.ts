import { NextFunction, Request, Response } from "express";
import { ItemModel, UserModel, VendorModel } from "../models";
import { HttpStatusCodes } from "../utility";
import { IAddItem } from "../dto/Items.dto";


//^ ADD ITEM
export const AddItem = async (req: Request, res: Response, next: NextFunction) => {
    const { itemName, itemDesc, itemCategory, itemPrice, itemQuantity } = <IAddItem>req.body;
    const user = req.user;

    try {
        const getVendor = await VendorModel.findOne({ userID: user?._id });

        if (getVendor) {
            const files = req.files as [Express.Multer.File];
            const images = files.map((file: Express.Multer.File) => file.filename);

            const itemCreated = await ItemModel.create({
                vendorID: getVendor._id,
                itemName: itemName,
                itemDesc: itemDesc,
                itemCategory: itemCategory,
                itemPrice: itemPrice,
                itemQuantity: itemQuantity,
                itemImages: images
            });

            getVendor.vendorItems.push(itemCreated._id);

            await Promise.all([itemCreated.save(), getVendor.save()]);
            return res.status(HttpStatusCodes.Created).json({ message: "Item Added!" });
        }

        return res.status(HttpStatusCodes.Created).json({ message: "You are not a vendor" });
    }
    catch (error) {
        console.log(error);
        
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//^ FETCH ALL ITEMS 
export const GetAllItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const getItems = await ItemModel.find({}, '-password -__v -createdAt -updatedAt');

        if (getItems.length > 0) {
            return res.status(HttpStatusCodes.OK).json({ data: getItems });
        }

        return res.status(HttpStatusCodes.NoContent).end(); // Return 204 with no response body
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};




//^ DELETE ITEM BY ID
export const DeleteItemByID = async (req: Request, res: Response, next: NextFunction) => {
    const itemID = req.params.itemID;

    try {
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(itemID);

        if (!isValidObjectId) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });
        }

        const deletedItem = await ItemModel.findByIdAndDelete(itemID);

        if (deletedItem) {
            return res.status(HttpStatusCodes.OK).json({ message: "Successfully deleted an item" });
        }

        return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};

