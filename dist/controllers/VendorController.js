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
exports.GetVendorById = exports.GetAllVendor = exports.UpdateVendorBanner = exports.UpdateVendor = exports.CreateVendor = void 0;
const models_1 = require("../models");
const utility_1 = require("../utility");
const Cloudinary_1 = __importDefault(require("../services/Cloudinary"));
//^ CREATE VENDOR
const CreateVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorName, vendorDesc, userID } = req.body;
    try {
        const getUser = yield models_1.UserModel.findById(userID);
        const isExistingVendor = yield models_1.VendorModel.findOne({ vendorName: vendorName });
        if (getUser.role === "vendor") {
            return res.status(utility_1.HttpStatusCodes.BadRequest).json({ message: "Sorry, you already have a shop" });
        }
        if (isExistingVendor) {
            return res.status(utility_1.HttpStatusCodes.OK).json({ message: "Name already exists." });
        }
        if (getUser) {
            const file = req.file;
            const createdVendor = yield models_1.VendorModel.create({
                userID: getUser,
                vendorName: vendorName,
                vendorDesc: vendorDesc,
                vendorRatings: 0,
                vendorFollowers: 0,
                vendorBanner: file === null || file === void 0 ? void 0 : file.filename,
                vendorFeedback: [],
                vendorItems: []
            });
            getUser.role = "vendor";
            getUser.vendorInfo = createdVendor.id;
            yield getUser.save();
            return res.status(utility_1.HttpStatusCodes.Created).json({ message: "You can now sell!" });
        }
        return res.status(utility_1.HttpStatusCodes.NoContent).end();
    }
    catch (error) {
        console.log(error.message);
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.CreateVendor = CreateVendor;
//^ UPDATE VENDOR INFO
const UpdateVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vendorID, vendorName, vendorDesc } = req.body;
        const existingVendor = yield models_1.VendorModel.findOne({ _id: vendorID });
        if (existingVendor) {
            existingVendor.vendorName = vendorName;
            existingVendor.vendorDesc = vendorDesc;
            existingVendor.save();
            return res.status(utility_1.HttpStatusCodes.OK).json({ message: "Vendor Successfully Updated!" });
        }
        else {
            return res.status(utility_1.HttpStatusCodes.NoContent).end(); // Return 204 with no response body
        }
    }
    catch (error) {
        console.log(error);
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.UpdateVendor = UpdateVendor;
//^ UPDATE VENDOR BANNER
const UpdateVendorBanner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vendorID } = req.body;
        const existingVendor = yield models_1.VendorModel.findOne({ _id: vendorID });
        if (!existingVendor) {
            return res.status(utility_1.HttpStatusCodes.Forbidden).json({ message: "You are not authorized!" });
        }
        const file = req.file;
        if (!file) {
            return res.status(utility_1.HttpStatusCodes.BadRequest).json({ message: "No image file provided" });
        }
        // Check if the uploaded file is an image
        if (!file.mimetype.startsWith('image')) {
            return res.status(utility_1.HttpStatusCodes.BadRequest).json({ message: "Invalid image file format" });
        }
        console.log("req: ", req.file.path);
        // Upload the file buffer to Cloudinary
        const result = yield Cloudinary_1.default.uploader.upload(file.path, {
            public_id: `vendor_${existingVendor.vendorName}_${Date.now()}`, // Unique public ID for the uploaded image
        });
        // Update the vendor's banner URL in the database with the Cloudinary URL
        existingVendor.vendorBanner = result.secure_url;
        // Save the changes to the database
        yield existingVendor.save();
        // Optionally, delete the previous banner file from the local server if needed
        return res.status(utility_1.HttpStatusCodes.OK).json({ message: "Vendor banner updated successfully", imageUrl: result.secure_url });
    }
    catch (error) {
        console.error(error);
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: error });
    }
});
exports.UpdateVendorBanner = UpdateVendorBanner;
//^ GET ALL VENDORS
const GetAllVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getVendors = yield models_1.VendorModel.find({}, '-password -__v -createdAt -updatedAt');
        if (getVendors.length > 0) {
            return res.status(utility_1.HttpStatusCodes.OK).json({ data: getVendors });
        }
        return res.status(utility_1.HttpStatusCodes.NoContent).end(); // Return 204 with no response body
    }
    catch (error) {
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.GetAllVendor = GetAllVendor;
//^ GET VENDOR BY ID
const GetVendorById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { vendorID } = req.body;
    try {
        const getVendors = yield models_1.VendorModel.findById(vendorID);
        let getItems = [];
        if (getVendors) {
            getItems = yield Promise.all(getVendors.vendorItems.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                return yield models_1.ItemModel.findById(item);
            })));
            return res.status(utility_1.HttpStatusCodes.OK).json({ data: getVendors, vendorItems: getItems });
        }
        return res.status(utility_1.HttpStatusCodes.NotFound).json({ message: "User not found!" });
    }
    catch (error) {
        return res.status(utility_1.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.GetVendorById = GetVendorById;
//# sourceMappingURL=VendorController.js.map