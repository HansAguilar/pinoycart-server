import express from "express";
import { AddOrder, AddToCart, ClearCart, CreateUser, DeleteCartItemByID, EditUser, FollowVendor, GetAllUser, GetCart, GetUserById, Login, UpdateOrder, VerifyUserToken } from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

router.post("/user/register", CreateUser);
router.post("/user/login", Login);
router.post("/user/verify-token", VerifyUserToken);

router.use(Authenticate);
router.get("/get-users", GetAllUser);
router.get("/get-user/:userID", GetUserById);
router.put("/edit-user", EditUser);


router.post("/follow-vendor", FollowVendor);

router.post("/add-cart", AddToCart);
router.get("/get-cart", GetCart);
router.post("/remove-cart", DeleteCartItemByID);
router.delete("/clear-cart", ClearCart);


router.post("/add-order", AddOrder);
router.put("/update-order/:orderID", UpdateOrder);

export { router as UserRoutes }