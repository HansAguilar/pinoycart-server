import { Request, Response, NextFunction } from "express";
import { IAddOrder, ICreateUser, IUserEditInput, IUserLoginInput } from "../dto/User.dto";
import { ItemModel, OrderModel, UserModel, VendorModel } from "../models";
import { GenerateHashPassword, GenerateSalt, GenerateSignToken, ValidatePassword, isValidObjectId } from "../utility";
import { IFollowVendorID } from "../dto/Vendor.dto";
import { HttpStatusCodes } from "../utility";

//* REGISTER USER
export const CreateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password, email, phone, address } = <ICreateUser>req.body;

    try {
        const existingUser = await UserModel.findOne({ $or: [{ email: email }, { phone: phone }] });

        //^ if user already exists
        if (existingUser) {
            return res.status(HttpStatusCodes.BadRequest).json({ message: "Sorry, email or phone number already exists!." });
        }

        //^ hash the password
        const salt = await GenerateSalt();
        const hashPassword = await GenerateHashPassword(password, salt);

        await UserModel.create({
            username: username,
            password: hashPassword,
            email: email,
            phone: phone,
            address: {
                city: address.city,
                street: address.street,
                postal: address.postal
            },
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
    const { email, phone, address } = <IUserEditInput>req.body;
    const user = req.user;

    try {
        const userExist = await UserModel.findById(user?._id);

        if (!userExist) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }

        const existingUser = await UserModel.findOne({ $or: [{ email: email }, { phone: phone }] });
        if (existingUser) {
            return res.status(HttpStatusCodes.BadRequest).json({ message: "Sorry, email or phone number already exists!" });
        }

        userExist.email = email;
        userExist.phone = phone;
        userExist.address = address;

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

        const getUser = await UserModel.findOne({ _id: userID });

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

        if (!usernameExist) {
            return res.status(HttpStatusCodes.Unauthorized).json({ message: "Username or Password is incorrect!" });
        }

        const validate = await ValidatePassword(password, usernameExist.password);
        if (validate) {
            const sig = GenerateSignToken({
                _id: usernameExist._id,
                username: usernameExist.username,
                email: usernameExist.email,
                role: usernameExist.role,
            });
            return res.status(HttpStatusCodes.OK).json({ message: "Login Successfull!", token: sig });
        }

        return res.status(HttpStatusCodes.Unauthorized).json({ message: "Username or Password is incorrect!" });
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

        if (!validID) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "Vendor not found!" });
        }

        const currentUser = await UserModel.findById(req.user?._id);

        //^ check kung may exploit
        if (!currentUser) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        }

        //^ check kung vendor yung nag re-request
        if (currentUser.role === "vendor") {
            return res.status(HttpStatusCodes.BadRequest).json({ message: "Vendors cannot follow other vendors!" });
        }

        //^ -------------------------- SAFE BELOW ------------------------------
        const vendor = await VendorModel.findById(followVendor); //^ find vendors id from body

        if (!vendor) {
            return res.status(HttpStatusCodes.NotFound).json({ message: "Vendor not found!" });
        }

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
    const { items } = <IAddOrder>req.body;

    try {
        if (!req.body.items || !Array.isArray(req.body.items)) return res.status(HttpStatusCodes.BadRequest).json({ message: "Invalid request format" });

        const orders = [];
        let totalAmountOfAllItems: number = 0;

        const getUser = await UserModel.findById(req.user?._id);

        if (!getUser) return res.status(HttpStatusCodes.NotFound).json({ message: "User not found!" });
        if (getUser.role === "vendor") return res.status(HttpStatusCodes.NotFound).json({ message: "Vendor cannot add an order!" });

        for (let item of items) {
            const getItem = await ItemModel.findById(item.itemID);

            if (!getItem) {
                return res.status(HttpStatusCodes.NotFound).json({ message: "Item not found!" });
            }

            //^ guard clause kapag nag kiddy inspect sa item quantity
            if (getItem.itemQuantity < item.itemQuantity) return res.status(HttpStatusCodes.BadRequest).json({ message: "Something went wrong!" });

            totalAmountOfAllItems += (getItem.itemPrice * item.itemQuantity);

            orders.push({
                itemID: getItem._id,
                quantity: getItem.itemQuantity,
                price: getItem.itemPrice
            });
        }

        // const orderCreated = await OrderModel.create({
        //     customerID: getUser._id,
        //     items: orders,
        //     totalAmount: totalAmountOfAllItems
        // });

        return res.status(HttpStatusCodes.OK).json({ data: { totalAmountOfAllItems, orders } });
    }
    catch (error) {
        return res.status(HttpStatusCodes.InternalServerError).json({ message: "Internal Server Error" });
    }
};




//* GET USER ORDERS 
export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {

}

