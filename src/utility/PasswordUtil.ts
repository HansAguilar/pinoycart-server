import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";


import { IUserPayload } from "../dto/User.dto";
import { APP_X_KEY } from "../config";
import { AuthPayload } from "../dto/Auth.dto";

export const GenerateSalt = async () => {
    return await bcrypt.genSalt()
};


export const GenerateHashPassword = async (password: string, salt: string) => {
    return await bcrypt.hash(password, salt);
};


export const ValidatePassword = async (password: string, hashPasswordFromDB: string) => {
    return await bcrypt.compare(password, hashPasswordFromDB);
};


export const GenerateSignToken = (payload: IUserPayload) => {
    return jwt.sign(payload, APP_X_KEY, { expiresIn: '1d' })
};


export const ValidateSignToken = (req: Request) => {
    const token = req.get("Authorization");

    //^ if token exists
    if (token) {
        const payload = jwt.verify(token.split(' ')[1], APP_X_KEY) as AuthPayload;
        req.user = payload;
        return true;
    }
    
    //^ else
    return false;
};