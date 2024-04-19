"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const router = express_1.default.Router();
exports.UserRoutes = router;
router.post("/user/register", controllers_1.CreateUser);
router.post("/user/login", controllers_1.Login);
router.post("/user/verify-token", controllers_1.VerifyUserToken);
router.get("/get-users", controllers_1.GetAllUser);
router.post("/get-user", controllers_1.GetUserById);
router.post("/change-password", controllers_1.ChangePassword);
// router.use(Authenticate);
router.patch("/edit-user", controllers_1.EditUser);
router.post("/follow-vendor", controllers_1.FollowVendor);
router.post("/add-cart", controllers_1.AddToCart);
router.post("/minus-cart", controllers_1.MinusToCart);
router.post("/get-cart", controllers_1.GetCart);
router.post("/remove-cart", controllers_1.DeleteCartItemByID);
router.delete("/clear-cart", controllers_1.ClearCart);
router.post("/add-order", controllers_1.AddOrder);
router.put("/update-order/:orderID", controllers_1.UpdateOrder);
//# sourceMappingURL=UserRoutes.js.map