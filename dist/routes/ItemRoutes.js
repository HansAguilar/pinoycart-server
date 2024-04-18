"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRoutes = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
exports.ItemRoutes = router;
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
const imageStorage = multer_1.default.memoryStorage();
const images = (0, multer_1.default)({ storage: imageStorage }).array("images", 4);
router.get("/get-items", controllers_1.GetAllItems);
router.get("/get-item/:itemID", controllers_1.GetItemByID);
// router.use(Authenticate);
router.post("/add-item", images, controllers_1.AddItem);
router.patch("/update-item", images, controllers_1.UpdateItemByID);
router.post("/delete-item", controllers_1.DeleteItemByID);
router.post("/add-review", controllers_1.AddReview);
router.post("/like-review", controllers_1.LikeReviews);
//# sourceMappingURL=ItemRoutes.js.map