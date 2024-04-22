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
exports.VendorRoutes = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
exports.VendorRoutes = router;
//^ upload file boilerplate LOLOLOLOLOL
// const imageStorage = multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, 'uploads');
//     },
//     filename: function (req, file, callback) {
//         const uploadedFile = file.originalname.split('.');
//         const randomFile_ID = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const generateFilename = "vendor-" + uploadedFile[0] + "-" + randomFile_ID + "." + uploadedFile[1];
//         callback(null, generateFilename);
//     }
// });
// const images = multer({ storage: imageStorage }).array("images", 5);
// const imageStorage = multer.memoryStorage();
// const image = multer({ storage: imageStorage }).single("image");
const imageStorage = multer_1.default.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: imageStorage });
const uploadToCloudinary = (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.file) {
                console.log("pre", req.file);
                next();
                // You can proceed with uploading to Cloudinary here
            }
        });
    });
};
router.get("/get-vendors", controllers_1.GetAllVendor);
router.post("/get-vendor", controllers_1.GetVendorById);
// router.use(Authenticate);
router.patch("/update-vendor-banner", uploadToCloudinary, controllers_1.UpdateVendorBanner);
router.post("/create-vendor", controllers_1.CreateVendor);
router.patch("/update-vendor", controllers_1.UpdateVendor);
//# sourceMappingURL=VendorRoutes.js.map