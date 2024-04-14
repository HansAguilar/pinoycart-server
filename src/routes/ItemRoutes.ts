import express from "express";
import { Authenticate } from "../middlewares";
import { AddItem, AddReview, DeleteItemByID, GetAllItems, GetItemByID, LikeReviews, UpdateItemByID } from "../controllers";
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
//         const generateFilename = "item-" + uploadedFile[0] + "-" + randomFile_ID + "." + uploadedFile[1];
//         callback(null, generateFilename);
//     }
// });

const imageStorage = multer.memoryStorage();
const images = multer({ storage: imageStorage }).array("images", 4);

router.get("/get-items", GetAllItems);
router.get("/get-item/:itemID", GetItemByID);

// router.use(Authenticate);

router.post("/add-item", images, AddItem);
router.patch("/update-item", images, UpdateItemByID);
router.post("/delete-item", DeleteItemByID);
router.post("/add-review", AddReview);
router.post("/like-review", LikeReviews);


export { router as ItemRoutes }