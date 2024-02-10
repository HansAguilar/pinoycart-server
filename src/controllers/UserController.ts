import { Request, Response, NextFunction } from "express";
import { IUserOrder, ICreateUser, IUserEditInput, IUserLoginInput, ICart } from "../dto/User.dto";
import { ItemModel, OrderModel, UserModel, VendorModel } from "../models";
import { GenerateHashPassword, GenerateSalt, GenerateSignToken, ValidatePassword, isValidObjectId, verifyToken } from "../utility";
import { IFollowVendorID } from "../dto/Vendor.dto";
import { HttpStatusCodes } from "../utility";
import jwt from "jsonwebtoken";
import { APP_X_KEY } from "../config";
import { AuthPayload } from "../dto/Auth.dto";

//* REGISTER USER
export const CreateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password, email, phone } = <ICreateUser>req.body;

    try {
        const existingUser = await UserModel.findOne({ $or: [{ email: email }, { phone: phone }] });

        //^ if user already exists
        if (existingUser) {
            return res.status(HttpStatusCodes.BadRequest).json({ message: "Sorry, email or phone number already exists" });
        }

        //^ hash the password
        const salt = await GenerateSalt();
        const hashPassword = await GenerateHashPassword(password, salt);

        await UserModel.create({
            username: username,
            password: hashPassword,
            email: email,
            phone: phone,
            orders: [],
            vendorInfo: null
        });

        res.status(HttpStatusCodes.Created).json({ message: "Account Created Successfully!" });
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};




//* EDIT USER
export const EditUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone } = <IUserEditInput>req.body;
    const user = req.user;

    try {
        const userExist = await UserModel.findById(user?._id);

        if (!userExist) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }

        const existingUser = await UserModel.findOne({ $or: [{ email: email }, { phone: phone }] });
        if (existingUser) {
            return res.status(HttpStatusCodes.BadRequest).json({ message: "Sorry, email or phone number already exists" });
        }

        userExist.email = email;
        userExist.phone = phone;

        await userExist.save();

        return res.status(HttpStatusCodes.OK).json({ message: "User Account Updated!" });
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//* GET ALL USERS
export const GetAllUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserModel.find({}, '-password -__v -createdAt -updatedAt').populate("vendorInfo", '-__v -createdAt -updatedAt').exec();

        if (users.length <= 0) {
            return res.status(HttpStatusCodes.NoContent).end(); // Return 204 with no response body
        }

        return res.status(HttpStatusCodes.OK).json({ data: users });
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//* GET USER BY ID
export const GetUserById = async (req: Request, res: Response, next: NextFunction) => {
    const userID = req.params.userID;

    try {
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userID);

        if (!isValidObjectId) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }

        const getUser = await UserModel.findOne({ _id: userID }, '-password -__v -createdAt -updatedAt').populate("orders", '-__v -createdAt -updatedAt');
        // await UserModel.findOne({ _id: userID })

        if (!getUser) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        } else {
            return res.status(HttpStatusCodes.OK).json({ data: getUser });
        }
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: error });
    }
};



//* LOGIN 
export const Login = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = <IUserLoginInput>req.body;

    //^ kunin natin ung username para makuha yung password
    try {
        const usernameExist = await UserModel.findOne({ username: username });

        if (usernameExist == null) {
            return res.status(HttpStatusCodes.Unauthorized).json({ message: "Username or Password is incorrect" });
        }

        const validate = await ValidatePassword(password, usernameExist.password);

        if (validate) {
            const sig = GenerateSignToken({
                _id: usernameExist._id,
                username: usernameExist.username,
                email: usernameExist.email,
                role: usernameExist.role,
            });

            res.cookie("token", sig, {
                httpOnly: true,
                maxAge: 9960000
            })

            return res.status(HttpStatusCodes.OK).json({ message: "Login Successfull", token: sig });
        }

        else {
            return res.status(HttpStatusCodes.Unauthorized).json({ message: "Username or Password is incorrect" });
        }
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//* FOLLOW A VENDOR
export const FollowVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { followVendor } = <IFollowVendorID>req.body;
        const validID = isValidObjectId(followVendor);

        if (!validID) return res.status(HttpStatusCodes.NotFound).json({ message: "Vendor not found!" });

        const currentUser = await UserModel.findById(req.user?._id);

        //^ check kung may exploit
        if (!currentUser) return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });

        //^ check kung vendor yung nag re-request
        if (currentUser.role === "vendor") return res.status(HttpStatusCodes.BadRequest).json({ message: "Vendors cannot follow other vendors!" });


        //^ -------------------------- SAFE BELOW ------------------------------

        const vendor = await VendorModel.findById(followVendor); //^ find vendors id from body

        if (!vendor) return res.status(HttpStatusCodes.NotFound).json({ message: "Vendor not found!" });


        //^ if user already follow that vendor, unfollow 
        if (currentUser.followed.includes(vendor.vendorName)) {
            const vendorIndex = currentUser.followed.indexOf(vendor.vendorName); //^ get the index of followed vendor sa array

            vendor.vendorFollowers -= 1;
            currentUser.followed.splice(vendorIndex, 1) //^ remove the followed vendor from array

            await Promise.all([vendor.save(), currentUser.save()]);

            return res.status(HttpStatusCodes.OK).json({ message: `You unfollowed ${vendor.vendorName}` });
        }

        vendor.vendorFollowers += 1;
        currentUser?.followed.push(vendor.vendorName);

        await Promise.all([vendor.save(), currentUser.save()]);

        return res.status(HttpStatusCodes.OK).json({ message: `You followed ${vendor.vendorName}` });
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//* ADD ORDER 
//! TODO: 
export const AddOrder = async (req: Request, res: Response, next: NextFunction) => {
    const { items } = <IUserOrder>req.body;

    try {
        if (items.length <= 1) {
            const VALID_ID = isValidObjectId(items[0].itemID);
            if (!VALID_ID) return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });
        }
        else {
            items.map((item) => {
                if (/^[0-9a-fA-F]{24}$/.test(item.itemID)) return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });
            })
        }
        if (items || !Array.isArray(items)) return res.status(HttpStatusCodes.BadRequest).json({ message: "Invalid request format" });

        let orders = [];
        let totalAmountOfAllItems: number = 0;

        const getUser = await UserModel.findById(req.user?._id);

        if (getUser.role === "vendor") return res.status(HttpStatusCodes.NotFound).json({ message: "Vendor cannot add an order!" });

        for (let item of items) {
            if (
                typeof item.itemQuantity !== 'number' ||
                isNaN(item.itemQuantity) ||
                item.itemQuantity.toString().includes("'")
            ) return res.status(HttpStatusCodes.BadRequest).json({ message: "Invalid request format" });

            const getItem = await ItemModel.findById(item.itemID);

            if (!getItem) return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });

            //^ guard clause kapag nag kiddy inspect sa item quantity
            if (getItem.itemStock < item.itemQuantity) return res.status(HttpStatusCodes.BadRequest).json({ message: "Something went wrong!" });

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

        const orderCreated = await OrderModel.create({
            customerID: getUser._id,
            items: orders,
            totalAmount: totalAmountOfAllItems
        });

        getUser.orders.push(orderCreated._id);
        getUser.save();

        orders = [];
        totalAmountOfAllItems = 0;

        return res.status(HttpStatusCodes.Created).json({ data: orderCreated });
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//* UPDATE ORDER BY ID
//! TODO: UPDATE ORDER BY ID
export const UpdateOrder = async (req: Request, res: Response, next: NextFunction) => {
    const orderID = req.params.orderID;
    const { items } = <IUserOrder>req.body;
    try {
        const isOrderExist = await OrderModel.findById(orderID);
        return res.json({ data: isOrderExist });

    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
}


//* ADD TO CART 
export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {
    const { items } = <ICart>req.body;

    try {
        const getUser = await UserModel.findById(req.user?._id);

        if (!getUser) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }

        if (getUser.role === "vendor") {
            return res.status(HttpStatusCodes.Forbidden).json({ message: "Vendors cannot add items to the cart!" });
        }

        for (let item of items) {
            let getItem = await ItemModel.findOne({ _id: item.itemID }, '-__v -createdAt -updatedAt -itemReviews');

            if (!getItem) {
                return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });
            }

            // Find the index of the item in the user's cart
            const cartIndex = getUser.cart.findIndex((cartItem) => cartItem.itemID === item.itemID);

            if (cartIndex !== -1) {
                // Item is already in the cart, increment the quantity
                getUser.cart[cartIndex].itemQuantity += item.itemQuantity;
            } else {
                // Item is not in the cart, add it
                getUser.cart.push({
                    itemID: item.itemID,
                    itemQuantity: item.itemQuantity,
                });
            }
        }

        await getUser.save();
        return res.status(HttpStatusCodes.Created).json({ message: "Added to cart!" })
    }
    catch (error) {
        console.log(error)
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
}



//* GET USER CART 
export const GetCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const getUser = await UserModel.findById(req.user?._id).select("cart");
        console.log(getUser);


        if (!getUser) return res.status(HttpStatusCodes.NotFound).json({ message: "User not found" });

        if (getUser.cart.length <= 0) return res.status(HttpStatusCodes.NotFound).json({ message: "No item in your cart!" });

        let cartItems = [];

        for (const item of getUser.cart) {
            const cartItem = await ItemModel.findOne({ _id: item.itemID }, '-__v -createdAt -itemReviews -updateAt');
            console.log(item.itemQuantity);

            if (cartItem) {
                cartItem.itemStock = item.itemQuantity
                cartItems.push(cartItem);
            }
        }

        res.status(HttpStatusCodes.OK).json({ data: cartItems });
        cartItems = [];
        return;
    } catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//* REMOVE USER CART ITEM 
export const DeleteCartItemByID = async (req: Request, res: Response, next: NextFunction) => {
    const getItemID = req.body.cartID;
    try {
        const getItem = ItemModel.findOne({ _id: getItemID });

        if (!getItem) return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });

        const getUser = await UserModel.findById(req.user?._id);

        if (!getUser) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }

        // Find the index of the item in the user's cart
        const cartIndex = getUser.cart.findIndex((cartItem) => cartItem.itemID === getItemID);

        if (cartIndex !== -1) {
            // Remove the item and its quantity from the cart arrays
            getUser.cart.splice(cartIndex, 1);

            // Save the updated user document
            await getUser.save();

            return res.status(HttpStatusCodes.OK).json({ message: "Item removed from the cart!" });
        } else {
            return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found in the user's cart!" });
        }
    } catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};




//* CLEAR USER CART 
export const ClearCart = async (req: Request, res: Response, next: NextFunction) => {
    const getItemID = req.body.cartID;
    try {
        const getItem = ItemModel.findOne({ _id: getItemID });

        if (!getItem) return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });

        const getUser = await UserModel.findById(req.user?._id);

        if (!getUser) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }

        getUser.cart.splice(0, getUser.cart.length);

        await getUser.save();
        return res.status(HttpStatusCodes.OK).json({ message: "Clear cart successfully!" });
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};



//* VERIFY USER TOKEN
export const VerifyUserToken = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
    try {
        const payload = verifyToken(token);
        if (payload) {
            const user = await UserModel.findOne({ _id: payload._id }, '-__v -createdAt -updatedAt -password');
            return res.status(HttpStatusCodes.OK).json({ data: user });
        }
        else {
            return res.status(HttpStatusCodes.Unauthorized).json({ message: token });
        }
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
}
