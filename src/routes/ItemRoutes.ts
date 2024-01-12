import express from "express";
import { Authenticate } from "../middlewares";
import { AddItem, AddReview, DeleteItemByID, GetAllItems, GetItemByID, UpdateItemByID } from "../controllers";
import multer from "multer";

const router = express.Router();

//^ upload file boilerplate LOLOLOLOLOL
const imageStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads');
    },
    filename: function (req, file, callback) {
        const uploadedFile = file.originalname.split('.');
        const randomFile_ID = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const generateFilename = "item-" + uploadedFile[0] + "-" + randomFile_ID + "." + uploadedFile[1];
        callback(null, generateFilename);
    }
});

const images = multer({ storage: imageStorage }).array("images", 5);

router.use(Authenticate);

router.get("/get-items", GetAllItems);
router.post("/add-item", images, AddItem);
router.put("/update-item/:itemID", images, UpdateItemByID);
router.delete("/delete-item/:itemID", DeleteItemByID);
router.get("/get-item/:itemID", GetItemByID);


router.post("/add-review", AddReview);


export { router as ItemRoutes }