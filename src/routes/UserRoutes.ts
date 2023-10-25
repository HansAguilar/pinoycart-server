import express from "express";
import { AddOrder, CreateUser, EditUser, FollowVendor, GetAllUser, GetUserById, Login } from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

router.post("/user/register", CreateUser);
router.post("/user/login", Login);

router.use(Authenticate);
router.get("/get-users", GetAllUser);
router.get("/get-user/:userID", GetUserById);
router.put("/edit-user", EditUser);


router.post("/follow-vendor", FollowVendor);
router.post("/add-order", AddOrder);

export { router as UserRoutes }