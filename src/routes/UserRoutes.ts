import express from "express";
import { AddOrder, AddToCart, ChangePassword, ClearCart, CreateUser, DeleteCartItemByID, EditUser, FollowVendor, GetAllUser, GetCart, GetUserById, Login, MinusToCart, UpdateOrder, VerifyUserToken } from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

router.post("/user/register", CreateUser);
router.post("/user/login", Login);
router.post("/user/verify-token", VerifyUserToken);
router.get("/get-users", GetAllUser);
router.post("/get-user", GetUserById);

router.post("/change-password", ChangePassword);

// router.use(Authenticate);

router.patch("/edit-user", EditUser);
router.post("/follow-vendor", FollowVendor);

router.post("/add-cart", AddToCart);
router.post("/minus-cart", MinusToCart);
router.post("/get-cart", GetCart);
router.post("/remove-cart", DeleteCartItemByID);
router.delete("/clear-cart", ClearCart);


router.post("/add-order", AddOrder);
router.put("/update-order/:orderID", UpdateOrder);

export { router as UserRoutes }