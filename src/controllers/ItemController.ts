import { NextFunction, Request, Response } from "express";
import { ItemModel, ReviewModel, UserModel, VendorModel } from "../models";
import { HttpStatusCodes, isValidObjectId } from "../utility";
import { IAddItem, IAddReview } from "../dto/Items.dto";
import cloudinary from "../services/Cloudinary";
import { Readable } from 'stream';

//^ ADD ITEM
export const AddItem = async (req: Request, res: Response, next: NextFunction) => {
    const { itemName, itemDesc, itemCategory, itemPrice, itemStock, vendorID } = <IAddItem>req.body;

    try {
        const getVendor = await VendorModel.findOne({ _id: vendorID });

        if (!getVendor) {
            return res.status(HttpStatusCodes.OK).json({ message: "You are not a vendor" });
        }

        if (getVendor) {
            let images = [];
            let uploadPromises = []; // Array to store promises returned by cloudinary.uploader.upload

            // Upload each file to Cloudinary and store the URLs
            for (const file of req.files as any[]) {
                const fileStream = Readable.from(file.buffer); // Convert buffer to readable stream

                // Convert the readable stream to a Base64-encoded string
                let base64String = '';
                fileStream.on('data', (chunk) => {
                    base64String += chunk.toString('base64');
                });

                // Create a promise for each upload operation
                const uploadPromise = new Promise((resolve, reject) => {
                    fileStream.on('end', async () => {
                        try {
                            // Upload the Base64-encoded string to Cloudinary
                            const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${base64String}`, {
                                public_id: `item-${itemName}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
                            });
                            resolve(result.secure_url);
                        } catch (error) {
                            reject(error);
                        }
                    });
                });

                uploadPromises.push(uploadPromise);
            }

            images = await Promise.all(uploadPromises);

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
    }
    catch (error) {
        console.log(error);
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//^ UPDATE ITEM
export const UpdateItemByID = async (req: Request, res: Response, next: NextFunction) => {
    const { vendorID, itemID, itemName, itemDesc, itemCategory, itemPrice, itemStock } = <IAddItem>req.body;

    try {
        const getVendor = await VendorModel.findOne({ _id: vendorID });

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
                }
                else {
                    return res.status(HttpStatusCodes.BadRequest).json({ message: "No matching document found for update." });
                }
            }
            else {
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
        if (!isValidObjectId(itemID)) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });
        }

        const getItem = await ItemModel.findOne({ _id: itemID }, '-__v -createdAt -updatedAt')
            .populate({
                path: 'itemReviews',
                select: '-__v -updatedAt -createdAt', // Exclude __v, updatedAt, and createdAt fields
                populate: {
                    path: 'userID',
                    model: 'users',
                    select: 'username' // Include only the username field
                }
            });

        if (!getItem) {
            return res.status(HttpStatusCodes.NotFound).json({ message: 'Item not found' });
        }

        const item = {
            ...getItem.toJSON(), // Convert Mongoose document to plain object
        };

        return res.status(HttpStatusCodes.OK).json(item);
    } catch (error) {
        console.error(error);
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
            vendor.vendorItems = vendor.vendorItems.filter(itemId => itemId !== itemID);

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



//^ ADD REVIEWS
export const AddReview = async (req: Request, res: Response, next: NextFunction) => {
    const { userID, itemID, rating, comment } = <IAddReview>req.body.data;

    try {
        if (userID && itemID && rating && comment) {
            const review = await ReviewModel.create({ userID, itemID, rating, comment });
            const item = await ItemModel.findById(itemID);

            if (review && item) {
                item.itemReviews.push(review.id);
                await item.save();
            }

            return res.status(HttpStatusCodes.Created).json({ data: item, message: 'Review added successfully' });
        }

        else {
            return res.status(HttpStatusCodes.Created).json({ message: 'Fill up all fields' });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.InternalServerError).json({ message: 'Internal Server Error' });
    }
};



//^ LIKE REVIEWS
export const LikeReviews = async (req: Request, res: Response, next: NextFunction) => {
    const { reviewID, userID } = req.body;

    try {
        if (reviewID) {
            const review = await ReviewModel.findById(reviewID);

            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            if (!review.whoLikes.includes(userID)) {
                review.whoLikes.push(userID);
                review.likes += 1;
            }
            else {
                // Remove user from the list of likes if already present
                review.whoLikes = review.whoLikes.filter((id: string) => id !== userID);
                review.likes -= 1;
            }

            await review.save(); // Save the updated review

            return res.status(HttpStatusCodes.Created).json({ message: "Liked/Unliked review" }); // Status code 201 for successful like/unlike
        }
        else {
            return res.status(HttpStatusCodes.BadRequest).json({ message: 'Missing reviewID in request body' });
        }
    } catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.InternalServerError).json({ message: 'Internal Server Error' });
    }
};


