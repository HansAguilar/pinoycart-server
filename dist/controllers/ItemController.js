"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeReviews = exports.AddReview = exports.DeleteItemByID = exports.GetItemByID = exports.GetAllItems = exports.UpdateItemByID = exports.AddItem = void 0;
const models_1 = require("../models");
const utility_1 = require("../utility");
const Cloudinary_1 = __importDefault(require("../services/Cloudinary"));
const stream_1 = require("stream");
//^ ADD ITEM
const AddItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemName, itemDesc, itemCategory, itemPrice, itemStock, vendorID } = req.body;
    try {
        const getVendor = yield models_1.VendorModel.findOne({ _id: vendorID });
        if (!getVendor) {
            return res.status(utility_1.HttpStatusCodes.OK).json({ message: "You are not a vendor" });
        }
        if (getVendor) {
            let images = [];
            let uploadPromises = []; // Array to store promises returned by cloudinary.uploader.upload
            // Upload each file to Cloudinary and store the URLs
            for (const file of req.files) {
                const fileStream = stream_1.Readable.from(file.buffer); // Convert buffer to readable stream
                // Convert the readable stream to a Base64-encoded string
                let base64String = '';
                fileStream.on('data', (chunk) => {
                    base64String += chunk.toString('base64');
                });
                // Create a promise for each upload operation
                const uploadPromise = new Promise((resolve, reject) => {
                    fileStream.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            // Upload the Base64-encoded string to Cloudinary
                            const result = yield Cloudinary_1.default.uploader.upload(`data:${file.mimetype};base64,${base64String}`, {
                                public_id: `item-${itemName}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
                            });
                            resolve(result.secure_url);
                        }
                        catch (error) {
                            reject(error);
                        }
                    }));
                });
                uploadPromises.push(uploadPromise);
            }
            images = yield Promise.all(uploadPromises);
            const itemCreated = yield models_1.ItemModel.create({
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
            yield Promise.all([itemCreated.save(), getVendor.save()]);
            return res.status(utility_1.HttpStatusCodes.Created).json({ message: "Item Added!" });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.AddItem = AddItem;
//^ UPDATE ITEM
const UpdateItemByID = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorID, itemID, itemName, itemDesc, itemCategory, itemPrice, itemStock } = req.body;
    try {
        const getVendor = yield models_1.VendorModel.findOne({ _id: vendorID });
        if (getVendor) {
            const getItem = yield models_1.ItemModel.findById(itemID);
            if (getItem) {
                const files = req.files;
                const images = files.map((file) => file.filename);
                // Construct the update object based on provided fields
                const updateObject = {};
                if (itemName)
                    updateObject.itemName = itemName;
                if (itemDesc)
                    updateObject.itemDesc = itemDesc;
                if (itemCategory)
                    updateObject.itemCategory = itemCategory;
                if (itemPrice)
                    updateObject.itemPrice = itemPrice;
                if (itemStock)
                    updateObject.itemStock = itemStock;
                if (images.length > 0)
                    updateObject.itemImages = images;
                const updatedItem = yield models_1.ItemModel.updateOne({ _id: itemID, vendorID: getVendor._id }, // Update criteria
                { $set: updateObject });
                if (updatedItem.acknowledged) {
                    return res.status(utility_1.HttpStatusCodes.Created).json({ message: "Item Updated!" });
                }
                else {
                    return res.status(utility_1.HttpStatusCodes.BadRequest).json({ message: "No matching document found for update." });
                }
            }
            else {
                return res.status(utility_1.HttpStatusCodes.NotFound).json({ message: "Item not found" });
            }
        }
        return res.status(utility_1.HttpStatusCodes.Unauthorized).json({ message: "You are not a vendor" });
    }
    catch (error) {
        console.log(error);
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.UpdateItemByID = UpdateItemByID;
//^ FETCH ALL ITEMS 
const GetAllItems = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getItems = yield models_1.ItemModel.find({}, '-password -__v -createdAt -updatedAt').populate('vendorID', '-vendorItems');
        ;
        if (getItems.length > 0) {
            return res.status(utility_1.HttpStatusCodes.OK).json({ data: getItems });
        }
        return res.status(utility_1.HttpStatusCodes.NoContent).end(); // Return 204 with no response body
    }
    catch (error) {
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.GetAllItems = GetAllItems;
//^ FETCH ITEM BY ID
const GetItemByID = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const itemID = req.params.itemID;
    try {
        if (!(0, utility_1.isValidObjectId)(itemID)) {
            return res.status(utility_1.HttpStatusCodes.NotFound).json({ message: "Item not found!" });
        }
        const getItem = yield models_1.ItemModel.findOne({ _id: itemID }, '-__v -createdAt -updatedAt')
            .populate({
            path: 'itemReviews',
            select: '-__v -updatedAt -createdAt',
            populate: {
                path: 'userID',
                model: 'users',
                select: 'username' // Include only the username field
            }
        });
        if (!getItem) {
            return res.status(utility_1.HttpStatusCodes.NotFound).json({ message: 'Item not found' });
        }
        const item = Object.assign({}, getItem.toJSON());
        return res.status(utility_1.HttpStatusCodes.OK).json(item);
    }
    catch (error) {
        console.error(error);
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.GetItemByID = GetItemByID;
//^ DELETE ITEM BY ID
const DeleteItemByID = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemID } = req.body;
    try {
        if (!(0, utility_1.isValidObjectId)(itemID)) {
            return res.status(utility_1.HttpStatusCodes.NotFound).json({ message: "Item not found!" });
        }
        const deletedItem = yield models_1.ItemModel.findOneAndDelete({ _id: itemID });
        const vendor = yield models_1.VendorModel.findById(deletedItem.vendorID);
        if (vendor) {
            vendor.vendorItems = vendor.vendorItems.filter(itemId => itemId !== itemID);
            yield vendor.save();
        }
        else {
            return res.status(utility_1.HttpStatusCodes.NotFound).json({ message: "Vendor not found!" });
        }
        if (deletedItem) {
            return res.status(utility_1.HttpStatusCodes.OK).json({ message: "Successfully deleted an item" });
        }
        return res.status(utility_1.HttpStatusCodes.NotFound).json({ message: "Item not found!" });
    }
    catch (error) {
        console.log(error);
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.DeleteItemByID = DeleteItemByID;
//^ ADD REVIEWS
const AddReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, itemID, rating, comment } = req.body.data;
    try {
        if (userID && itemID && rating && comment) {
            const review = yield models_1.ReviewModel.create({ userID, itemID, rating, comment });
            const item = yield models_1.ItemModel.findById(itemID);
            if (review && item) {
                item.itemReviews.push(review.id);
                yield item.save();
            }
            return res.status(utility_1.HttpStatusCodes.Created).json({ data: item, message: 'Review added successfully' });
        }
        else {
            return res.status(utility_1.HttpStatusCodes.Created).json({ message: 'Fill up all fields' });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: 'Internal Server Error' });
    }
});
exports.AddReview = AddReview;
//^ LIKE REVIEWS
const LikeReviews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewID, userID } = req.body;
    try {
        if (reviewID) {
            const review = yield models_1.ReviewModel.findById(reviewID);
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }
            if (!review.whoLikes.includes(userID)) {
                review.whoLikes.push(userID);
                review.likes += 1;
            }
            else {
                // Remove user from the list of likes if already present
                review.whoLikes = review.whoLikes.filter((id) => id !== userID);
                review.likes -= 1;
            }
            yield review.save(); // Save the updated review
            return res.status(utility_1.HttpStatusCodes.Created).json({ message: "Liked/Unliked review" }); // Status code 201 for successful like/unlike
        }
        else {
            return res.status(utility_1.HttpStatusCodes.BadRequest).json({ message: 'Missing reviewID in request body' });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: 'Internal Server Error' });
    }
});
exports.LikeReviews = LikeReviews;
//# sourceMappingURL=ItemController.js.map