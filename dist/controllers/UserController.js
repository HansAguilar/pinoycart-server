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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePassword = exports.VerifyUserToken = exports.ClearCart = exports.DeleteCartItemByID = exports.GetCart = exports.MinusToCart = exports.AddToCart = exports.UpdateOrder = exports.AddOrder = exports.FollowVendor = exports.Login = exports.GetUserById = exports.GetAllUser = exports.EditUser = exports.CreateUser = void 0;
const models_1 = require("../models");
const utility_1 = require("../utility");
const utility_2 = require("../utility");
//* REGISTER USER
const CreateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const isUsernameAvailable = yield models_1.UserModel.findOne({ username: username });
        if (isUsernameAvailable) {
            return res.status(utility_2.HttpStatusCodes.Conflict).json({ message: 'Username is already taken.' });
        }
        else {
            //^ hash the password
            const salt = yield (0, utility_1.GenerateSalt)();
            const hashPassword = yield (0, utility_1.GenerateHashPassword)(password, salt);
            yield models_1.UserModel.create({ username: username, password: hashPassword });
        }
        return res.status(utility_2.HttpStatusCodes.Created).json({ message: "Account Created Successfully!" });
    }
    catch (error) {
        console.log(error);
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.CreateUser = CreateUser;
//* EDIT USER
const EditUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, username } = req.body;
    try {
        // Validate user authorization
        const existingUser = yield models_1.UserModel.findById(userID);
        if (!existingUser) {
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "User not found" });
        }
        // Ensure the user making the request is authorized to modify the specified account
        if (existingUser._id.toString() !== userID) {
            return res.status(utility_2.HttpStatusCodes.Forbidden).json({ message: "You are not authorized to perform this action" });
        }
        existingUser.username = username;
        yield existingUser.save();
        return res.status(utility_2.HttpStatusCodes.OK).json({ message: "Username successfully updated!", data: existingUser });
    }
    catch (error) {
        console.log(error);
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.EditUser = EditUser;
//* GET ALL USERS
const GetAllUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield models_1.UserModel.find({}, '-password -__v -createdAt -updatedAt').populate("vendorInfo", '-__v -createdAt -updatedAt').exec();
        if (users.length <= 0) {
            return res.status(utility_2.HttpStatusCodes.NoContent).end(); // Return 204 with no response body
        }
        return res.status(utility_2.HttpStatusCodes.OK).json({ data: users });
    }
    catch (error) {
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.GetAllUser = GetAllUser;
//* GET USER BY ID
const GetUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.body;
    try {
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userID);
        if (!isValidObjectId) {
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }
        const getUser = yield models_1.UserModel.findOne({ _id: userID }, '-password -__v -createdAt -updatedAt');
        if (!getUser) {
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }
        return res.status(utility_2.HttpStatusCodes.OK).json({ data: getUser });
    }
    catch (error) {
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: error });
    }
});
exports.GetUserById = GetUserById;
//* LOGIN 
const Login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, localCart } = req.body;
    try {
        const user = yield models_1.UserModel.findOne({ username: username });
        if (!user) {
            return res.status(utility_2.HttpStatusCodes.Unauthorized).json({ message: "Username or Password is incorrect" });
        }
        const isPasswordValid = yield (0, utility_1.ValidatePassword)(password, user.password);
        if (isPasswordValid) {
            const token = (0, utility_1.GenerateSignToken)(user);
            if (localCart) {
                for (let item of localCart) {
                    let getItem = yield models_1.ItemModel.findOne({ _id: item._id }, '-__v -createdAt -updatedAt -itemReviews');
                    // Find the index of the item in the user's cart
                    if (getItem) {
                        const cartIndex = user.cart.findIndex((cartItem) => {
                            return cartItem.itemID === item._id;
                        });
                        if (cartIndex !== -1) {
                            // Item is already in the cart, increment the quantity
                            user.cart[cartIndex].itemQuantity += item.itemStock;
                        }
                        else {
                            // Item is not in the cart, add it
                            user.cart.push({
                                itemID: item._id,
                                itemQuantity: item.itemStock,
                            });
                        }
                    }
                }
                yield user.save();
            }
            const userData = yield models_1.UserModel.findOne({ _id: user._id }, '-__v -createdAt -updatedAt -password');
            return res.status(utility_2.HttpStatusCodes.OK).json({ message: "Login Successfull", token: token, data: userData });
        }
        else {
            return res.status(utility_2.HttpStatusCodes.Unauthorized).json({ message: "Username or Password is incorrect" });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.Login = Login;
//* FOLLOW A VENDOR
const FollowVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { followVendor } = req.body;
        const validID = (0, utility_1.isValidObjectId)(followVendor);
        if (!validID)
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "Vendor not found!" });
        const currentUser = yield models_1.UserModel.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        //^ check kung may exploit
        if (!currentUser)
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "User not found!" });
        //^ check kung vendor yung nag re-request
        if (currentUser.role === "vendor")
            return res.status(utility_2.HttpStatusCodes.BadRequest).json({ message: "Vendors cannot follow other vendors!" });
        //^ -------------------------- SAFE BELOW ------------------------------
        const vendor = yield models_1.VendorModel.findById(followVendor); //^ find vendors id from body
        if (!vendor)
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "Vendor not found!" });
        //^ if user already follow that vendor, unfollow 
        if (currentUser.followed.includes(vendor.vendorName)) {
            const vendorIndex = currentUser.followed.indexOf(vendor.vendorName); //^ get the index of followed vendor sa array
            vendor.vendorFollowers -= 1;
            currentUser.followed.splice(vendorIndex, 1); //^ remove the followed vendor from array
            yield Promise.all([vendor.save(), currentUser.save()]);
            return res.status(utility_2.HttpStatusCodes.OK).json({ message: `You unfollowed ${vendor.vendorName}` });
        }
        vendor.vendorFollowers += 1;
        currentUser === null || currentUser === void 0 ? void 0 : currentUser.followed.push(vendor.vendorName);
        yield Promise.all([vendor.save(), currentUser.save()]);
        return res.status(utility_2.HttpStatusCodes.OK).json({ message: `You followed ${vendor.vendorName}` });
    }
    catch (error) {
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.FollowVendor = FollowVendor;
//* ADD ORDER 
const AddOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { items } = req.body;
    try {
        if (items.length <= 1) {
            const VALID_ID = (0, utility_1.isValidObjectId)(items[0].itemID);
            if (!VALID_ID)
                return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "Item not found!" });
        }
        else {
            items.map((item) => {
                if (/^[0-9a-fA-F]{24}$/.test(item.itemID))
                    return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "Item not found!" });
            });
        }
        if (items || !Array.isArray(items))
            return res.status(utility_2.HttpStatusCodes.BadRequest).json({ message: "Invalid request format" });
        let orders = [];
        let totalAmountOfAllItems = 0;
        const getUser = yield models_1.UserModel.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b._id);
        if (getUser.role === "vendor")
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "Vendor cannot add an order!" });
        for (let item of items) {
            if (typeof item.itemQuantity !== 'number' ||
                isNaN(item.itemQuantity) ||
                item.itemQuantity.toString().includes("'"))
                return res.status(utility_2.HttpStatusCodes.BadRequest).json({ message: "Invalid request format" });
            const getItem = yield models_1.ItemModel.findById(item.itemID);
            if (!getItem)
                return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "Item not found!" });
            //^ guard clause kapag nag kiddy inspect sa item quantity
            if (getItem.itemStock < item.itemQuantity)
                return res.status(utility_2.HttpStatusCodes.BadRequest).json({ message: "Something went wrong!" });
            //^ insert sa items field ng Order model
            orders.push({
                itemID: getItem._id,
                quantity: item.itemQuantity,
                price: getItem.itemPrice,
                deliveryAddress: {
                    city: item.deliveryAddress.city,
                    street: item.deliveryAddress.street,
                    postal: item.deliveryAddress.postal
                }
            });
            totalAmountOfAllItems += (getItem.itemPrice * item.itemQuantity);
        }
        const orderCreated = yield models_1.OrderModel.create({
            customerID: getUser._id,
            items: orders,
            totalAmount: totalAmountOfAllItems
        });
        getUser.orders.push(orderCreated._id);
        getUser.save();
        orders = [];
        totalAmountOfAllItems = 0;
        return res.status(utility_2.HttpStatusCodes.Created).json({ data: orderCreated });
    }
    catch (error) {
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.AddOrder = AddOrder;
//* UPDATE ORDER BY ID
const UpdateOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orderID = req.params.orderID;
    const { items } = req.body;
    try {
        const isOrderExist = yield models_1.OrderModel.findById(orderID);
        return res.json({ data: isOrderExist });
    }
    catch (error) {
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.UpdateOrder = UpdateOrder;
//* ADD TO CART 
const AddToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { items, userID } = req.body;
    try {
        const getUser = yield models_1.UserModel.findById(userID);
        if (!getUser) {
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }
        for (let item of items) {
            let getItem = yield models_1.ItemModel.findOne({ _id: item.itemID }, '-__v -createdAt -updatedAt -itemReviews');
            if (!getItem) {
                return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "Item not found!" });
            }
            // Find the index of the item in the user's cart
            const cartIndex = getUser.cart.findIndex((cartItem) => cartItem.itemID === item.itemID);
            if (cartIndex !== -1) {
                // Item is already in the cart, increment the quantity
                getUser.cart[cartIndex].itemQuantity += item.itemQuantity;
            }
            else {
                // Item is not in the cart, add it
                getUser.cart.push({
                    itemID: item.itemID,
                    itemQuantity: item.itemQuantity,
                });
            }
        }
        yield getUser.save();
        return res.status(utility_2.HttpStatusCodes.Created).json({ message: "Added to cart!" });
    }
    catch (error) {
        console.log(error);
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.AddToCart = AddToCart;
//* MINUS TO CART 
const MinusToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { items, userID } = req.body;
    try {
        const getUser = yield models_1.UserModel.findById(userID);
        if (!getUser) {
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }
        for (let item of items) {
            let getItem = yield models_1.ItemModel.findOne({ _id: item.itemID }, '-__v -createdAt -updatedAt -itemReviews');
            if (!getItem) {
                return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "Item not found!" });
            }
            // Find the index of the item in the user's cart
            const cartIndex = getUser.cart.findIndex((cartItem) => cartItem.itemID === item.itemID);
            if (cartIndex !== -1) {
                // Decrement the item quantity
                getUser.cart[cartIndex].itemQuantity -= item.itemQuantity;
                // If the quantity becomes zero or negative, remove the item from the cart
                if (getUser.cart[cartIndex].itemQuantity <= 0) {
                    getUser.cart.splice(cartIndex, 1);
                }
            }
        }
        yield getUser.save();
        return res.status(utility_2.HttpStatusCodes.Created).json({ message: "Removed from cart!" });
    }
    catch (error) {
        console.log(error);
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.MinusToCart = MinusToCart;
//* GET USER CART 
const GetCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.body;
    try {
        const getUser = yield models_1.UserModel.findById(userID).select("cart");
        if (!getUser || getUser.cart.length <= 0)
            return res.status(utility_2.HttpStatusCodes.OK).json({ message: "No item in your cart!", data: [] });
        let cartItems = [];
        for (const item of getUser.cart) {
            const cartItem = yield models_1.ItemModel.findOne({ _id: item.itemID }, '-__v -createdAt -itemReviews -updateAt');
            if (cartItem) {
                cartItem.itemStock = item.itemQuantity;
                cartItems.push(cartItem);
            }
        }
        res.status(utility_2.HttpStatusCodes.OK).json({ data: cartItems });
        cartItems = [];
        return;
    }
    catch (error) {
        console.log(error);
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.GetCart = GetCart;
//* REMOVE CART ITEM 
const DeleteCartItemByID = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartID, userID } = req.body;
    try {
        const getItem = yield models_1.ItemModel.findOne({ _id: cartID });
        if (!getItem)
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "Item not found!" });
        const getUser = yield models_1.UserModel.findById(userID);
        if (!getUser) {
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }
        // Find the index of the item in the user's cart
        const cartIndex = getUser.cart.findIndex((cartItem) => cartItem.itemID === cartID);
        if (cartIndex !== -1) {
            // Remove the item and its quantity from the cart arrays
            getUser.cart.splice(cartIndex, 1);
            // Save the updated user document
            yield getUser.save();
            return res.status(utility_2.HttpStatusCodes.OK).json({ message: "Item removed from the cart!" });
        }
        else {
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "Item not found in the user's cart!" });
        }
    }
    catch (error) {
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.DeleteCartItemByID = DeleteCartItemByID;
//* CLEAR USER CART 
const ClearCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const getItemID = req.body.cartID;
    try {
        const getItem = models_1.ItemModel.findOne({ _id: getItemID });
        if (!getItem)
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "Item not found!" });
        const getUser = yield models_1.UserModel.findById((_c = req.user) === null || _c === void 0 ? void 0 : _c._id);
        if (!getUser) {
            return res.status(utility_2.HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }
        getUser.cart.splice(0, getUser.cart.length);
        yield getUser.save();
        return res.status(utility_2.HttpStatusCodes.OK).json({ message: "Clear cart successfully!" });
    }
    catch (error) {
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.ClearCart = ClearCart;
//* VERIFY USER TOKEN
const VerifyUserToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    try {
        const payload = (0, utility_1.verifyToken)(token);
        if (payload) {
            const user = yield models_1.UserModel.findOne({ _id: payload._id }, '-__v -createdAt -updatedAt -password');
            return res.status(utility_2.HttpStatusCodes.OK).json({ data: user });
        }
        else {
            return res.status(utility_2.HttpStatusCodes.Unauthorized).json({ message: token });
        }
    }
    catch (error) {
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.VerifyUserToken = VerifyUserToken;
//* CHANGE PASSWORD
const ChangePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, password } = req.body;
    try {
        if (!password) {
            return res.status(utility_2.HttpStatusCodes.BadRequest).json({ message: "Please input all fields" });
        }
        const user = yield models_1.UserModel.findById(userID);
        if (user) {
            const isCorrect = (0, utility_1.ValidatePassword)(password, user.password);
            if (isCorrect) {
                //^ hash the password
                const salt = yield (0, utility_1.GenerateSalt)();
                const hashPassword = yield (0, utility_1.GenerateHashPassword)(password, salt);
                yield models_1.UserModel.updateOne({ password: hashPassword });
            }
            yield user.save();
            return res.status(utility_2.HttpStatusCodes.OK).json({ message: "Password updated successfully" });
        }
    }
    catch (error) {
        return res.status(utility_2.HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
});
exports.ChangePassword = ChangePassword;
//# sourceMappingURL=UserController.js.map