import { Request, Response, NextFunction } from "express";
import { IUserOrder, ICreateUser, IUserEditInput, IUserLoginInput, ICart } from "../dto/User.dto";
import { ItemModel, OrderModel, UserModel, VendorModel } from "../models";
import { GenerateHashPassword, GenerateSalt, GenerateSignToken, ValidatePassword, isValidObjectId, verifyToken } from "../utility";
import { IFollowVendorID } from "../dto/Vendor.dto";
import { HttpStatusCodes } from "../utility";

//* REGISTER USER
export const CreateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = <ICreateUser>req.body;

    try {
        const isUsernameAvailable = await UserModel.findOne({ username: username });

        if (isUsernameAvailable) {
            return res.status(HttpStatusCodes.Conflict).json({ message: 'Username is already taken.' });
        }

        else {
            //^ hash the password
            const salt = await GenerateSalt();
            const hashPassword = await GenerateHashPassword(password, salt);
            await UserModel.create({ username: username, password: hashPassword });
        }

        return res.status(HttpStatusCodes.Created).json({ message: "Account Created Successfully!" });
    }

    catch (error) {
        console.log(error);
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};


//* EDIT USER
export const EditUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userID, username } = <{ userID: string, username: string }>req.body;

    try {
        // Validate user authorization
        const existingUser = await UserModel.findById(userID);

        if (!existingUser) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found" });
        }

        // Ensure the user making the request is authorized to modify the specified account
        if (existingUser._id.toString() !== userID) {
            return res.status(HttpStatusCodes.Forbidden).json({ message: "You are not authorized to perform this action" });
        }

        existingUser.username = username;
        await existingUser.save();

        return res.status(HttpStatusCodes.OK).json({ message: "Username successfully updated!", data: existingUser });
    }
    catch (error) {
        console.log(error)
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
    const { userID } = req.body;

    try {
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userID);

        if (!isValidObjectId) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }

        const getUser = await UserModel.findOne({ _id: userID }, '-password -__v -createdAt -updatedAt').populate("orders", '-__v -createdAt -updatedAt');


        console.log(getUser)
        if (!getUser) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }

        else {
            return res.status(HttpStatusCodes.OK).json({ data: getUser });
        }
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: error });
    }
};


//* LOGIN 
export const Login = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password, localCart } = <IUserLoginInput>req.body;

    try {
        const user = await UserModel.findOne({ username: username });

        if (!user) {
            return res.status(HttpStatusCodes.Unauthorized).json({ message: "Username or Password is incorrect" });
        }

        const isPasswordValid = await ValidatePassword(password, user.password);

        if (isPasswordValid) {
            const token = GenerateSignToken(user);

            if (localCart) {
                for (let item of localCart) {
                    let getItem = await ItemModel.findOne({ _id: item._id }, '-__v -createdAt -updatedAt -itemReviews');

                    // Find the index of the item in the user's cart
                    if (getItem) {
                        const cartIndex = user.cart.findIndex((cartItem) => {
                            return cartItem.itemID === item._id
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
                await user.save();
            }

            const userData = await UserModel.findOne({ _id: user._id }, '-__v -createdAt -updatedAt -password');
            return res.status(HttpStatusCodes.OK).json({ message: "Login Successfull", token: token, data: userData });
        }

        else {
            return res.status(HttpStatusCodes.Unauthorized).json({ message: "Username or Password is incorrect" });
        }
    }
    catch (error) {
        console.log(error);
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
    const { items, userID } = <ICart>req.body;

    try {
        const getUser = await UserModel.findById(userID);

        if (!getUser) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
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


//* MINUS TO CART 
export const MinusToCart = async (req: Request, res: Response, next: NextFunction) => {
    const { items, userID } = <ICart>req.body;

    try {
        const getUser = await UserModel.findById(userID);

        if (!getUser) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }

        for (let item of items) {
            let getItem = await ItemModel.findOne({ _id: item.itemID }, '-__v -createdAt -updatedAt -itemReviews');

            if (!getItem) {
                return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });
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

        await getUser.save();
        return res.status(HttpStatusCodes.Created).json({ message: "Removed from cart!" })
    }
    catch (error) {
        console.log(error)
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
}


//* GET USER CART 
export const GetCart = async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.body
    try {
        const getUser = await UserModel.findById(userID).select("cart");
        if (!getUser || getUser.cart.length <= 0) return res.status(HttpStatusCodes.OK).json({ message: "No item in your cart!", data: [] });

        let cartItems = [];

        for (const item of getUser.cart) {
            const cartItem = await ItemModel.findOne({ _id: item.itemID }, '-__v -createdAt -itemReviews -updateAt');

            if (cartItem) {
                cartItem.itemStock = item.itemQuantity
                cartItems.push(cartItem);
            }
        }

        res.status(HttpStatusCodes.OK).json({ data: cartItems });
        cartItems = [];
        return;
    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};


//* REMOVE CART ITEM 
export const DeleteCartItemByID = async (req: Request, res: Response, next: NextFunction) => {
    const { cartID, userID } = req.body;

    try {
        const getItem = await ItemModel.findOne({ _id: cartID });

        if (!getItem) return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });

        const getUser = await UserModel.findById(userID);

        if (!getUser) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }

        // Find the index of the item in the user's cart
        const cartIndex = getUser.cart.findIndex((cartItem) => cartItem.itemID === cartID);

        if (cartIndex !== -1) {
            // Remove the item and its quantity from the cart arrays
            getUser.cart.splice(cartIndex, 1);

            // Save the updated user document
            await getUser.save();

            return res.status(HttpStatusCodes.OK).json({ message: "Item removed from the cart!" });
        }
        else {
            return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found in the user's cart!" });
        }
    }
    catch (error) {
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


//* CHANGE PASSWORD
export const ChangePassword = async (req: Request, res: Response, next: NextFunction) => {
    const { userID, password } = req.body;

    try {
        if (!password) {
            return res.status(HttpStatusCodes.BadRequest).json({ message: "Please input all fields" });
        }

        const user = await UserModel.findById(userID);

        if (user) {
            const isCorrect = ValidatePassword(password, user.password);

            if (isCorrect) {
                //^ hash the password
                const salt = await GenerateSalt();
                const hashPassword = await GenerateHashPassword(password, salt);
                await UserModel.updateOne({ password: hashPassword });
            }
            await user.save();
            return res.status(HttpStatusCodes.OK).json({ message: "Password updated successfully" })
        }
    }

    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
}