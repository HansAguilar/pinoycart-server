import { NextFunction, Request, Response } from "express";
import { ItemModel, UserModel, VendorModel } from "../models";
import { HttpStatusCodes, isValidObjectId } from "../utility";
import { IAddItem, IReview } from "../dto/Items.dto";

//^ ADD ITEM
export const AddItem = async (req: Request, res: Response, next: NextFunction) => {
    const { itemName, itemDesc, itemCategory, itemPrice, itemStock } = <IAddItem>req.body;
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
                itemStock: itemStock,
                itemImages: images,
                itemRatings: 0,
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



//^ UPDATE ITEM
export const UpdateItemByID = async (req: Request, res: Response, next: NextFunction) => {
    const { itemID, itemName, itemDesc, itemCategory, itemPrice, itemStock } = <IAddItem>req.body;
    const user = req.user;

    try {
        const getVendor = await VendorModel.findOne({ userID: user?._id });

        if (getVendor) {
            const getItem = await ItemModel.findById(itemID);
            if (getItem) {
                const files = req.files as [Express.Multer.File];
                const images = files.map((file: Express.Multer.File) => file.filename);

                // Construct the update object based on provided fields
                const updateObject: any = {};
                if (itemName) updateObject.itemName = itemName;
                if (itemDesc) updateObject.itemDesc = itemDesc;
                if (itemCategory) updateObject.itemCategory = itemCategory;
                if (itemPrice) updateObject.itemPrice = itemPrice;
                if (itemStock) updateObject.itemStock = itemStock;
                if (images.length > 0) updateObject.itemImages = images;

                const updatedItem = await ItemModel.updateOne(
                    { _id: itemID, vendorID: getVendor._id }, // Update criteria
                    { $set: updateObject }
                );

                if (updatedItem.acknowledged) {
                    return res.status(HttpStatusCodes.Created).json({ message: "Item Updated!" });
                } else {
                    return res.status(HttpStatusCodes.BadRequest).json({ message: "No matching document found for update." });
                }
            } else {
                return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found" });
            }
        }
        return res.status(HttpStatusCodes.Unauthorized).json({ message: "You are not a vendor" });
    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//^ FETCH ALL ITEMS 
export const GetAllItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const getItems = await ItemModel.find({}, '-password -__v -createdAt -updatedAt').populate('vendorID', '-vendorItems');;

        if (getItems.length > 0) {
            return res.status(HttpStatusCodes.OK).json({ data: getItems });
        }

        return res.status(HttpStatusCodes.NoContent).end(); // Return 204 with no response body
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};




//^ FETCH ITEM BY ID
export const GetItemByID = async (req: Request, res: Response, next: NextFunction) => {
    const itemID = req.params.itemID;
    try {
        if (!isValidObjectId(itemID)) return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });

        const getItem = await ItemModel.findOne({ _id: itemID }, '-__v');
        return res.status(HttpStatusCodes.OK).json({ getItem });
    }
    catch (error) {
        console.log(error);

        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};




//^ DELETE ITEM BY ID
export const DeleteItemByID = async (req: Request, res: Response, next: NextFunction) => {
    const { itemID } = req.body;

    try {
        if (!isValidObjectId(itemID)) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });
        }

        const deletedItem = await ItemModel.findOneAndDelete({ _id: itemID });

        const vendor = await VendorModel.findById(deletedItem.vendorID);

        if (vendor) {
            console.log("Before removal:", vendor.vendorItems);
            vendor.vendorItems = vendor.vendorItems.filter(itemId => itemId !== itemID);
            console.log("After removal:", vendor.vendorItems);

            await vendor.save();
        } else {
            return res.status(HttpStatusCodes.NotFound).json({ message: "Vendor not found!" });
        }


        if (deletedItem) {
            return res.status(HttpStatusCodes.OK).json({ message: "Successfully deleted an item" });
        }

        return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });
    }
    catch (error) {
        console.log(error);

        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//! DITO TAYO NAGTAPOS
//^ ADD REVIEWS
export const AddReview = async (req: Request, res: Response, next: NextFunction) => {
    const { itemID, rating, comment } = <IReview>req.body;
    try {
        if (req.user?.role === "vendor") return res.status(HttpStatusCodes.Unauthorized).json({ message: "Vendor cannot add a review" });

        const item = await ItemModel.findById(itemID);

        if (!item) {
            return res.status(HttpStatusCodes.NotFound).json({ message: 'Item not found' });
        }

        item.itemReviews.push({
            userID: req.user?._id,
            rating,
            comment,
        });

        await item.save();
        return res.status(HttpStatusCodes.Created).json({ message: 'Review added successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.InternalServerError).json({ message: 'Internal Server Error' });
    }
};

