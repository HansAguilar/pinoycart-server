import express, { Application, Response } from "express";
import cors from "cors";
import { ItemRoutes, UserRoutes, VendorRoutes, PaymentRoutes } from "../routes";
import cookieParser from 'cookie-parser';

export default async (app: Application) => {
    app.use(cors({
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        origin: 'https://pinoycart-client.vercel.app',
    })); //! this solves the cors problem in frontend
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res: Response, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*")
        next();
    });

    app.use('/uploads', express.static('uploads'));

    app.use("/api/v1", [UserRoutes, VendorRoutes, ItemRoutes, PaymentRoutes]);

    return app;
};