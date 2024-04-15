import express from "express";
import { CreateVendor, GetAllVendor, GetVendorById, UpdateVendor, UpdateVendorBanner } from "../controllers";
import { Authenticate } from "../middlewares";
import multer from "multer";

const router = express.Router();

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

const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = (req, res, next) => {
    upload.single('image')(req, res, async function (err) {
        if (req.file) {
            console.log("pre", req.file)
        }
        next();
    });
};


router.get("/get-vendors", GetAllVendor);
router.post("/get-vendor", GetVendorById);

// router.use(Authenticate);

router.patch("/update-vendor-banner", uploadToCloudinary, UpdateVendorBanner);
router.post("/create-vendor", CreateVendor);
router.patch("/update-vendor", UpdateVendor);

export { router as VendorRoutes }