import { AuthPayload } from "../dto/Auth.dto";
import { Request, Response, NextFunction } from "express";
import { ValidateSignToken } from "../utility";

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload
        }
    }
}


export const Authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const validate = ValidateSignToken(req);

        if (validate) {
            next();
        }
        else {
            res.status(403).json({ message: "You are not authorized!" });
        }
    } catch (error) {
        res.status(500).json({ message: "You are not authorized!" });
    }
};