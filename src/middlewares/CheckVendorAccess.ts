import { Request, Response, NextFunction } from "express";
import { HttpStatusCodes } from "../utility/HttpStatusCodes";

export const CheckVendorAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userRole = req.user?.role;

        if (userRole === "vendor") {
            next();
        }
        else {
            res.status(HttpStatusCodes.Forbidden).json({ message: "MW: You are not authorized!" });
        }
    }
    catch (error) {
        console.log("check vendor access file:::", error);
        
        res.status(HttpStatusCodes.Forbidden).json({ message: "You are not authorized!" });
    }
}