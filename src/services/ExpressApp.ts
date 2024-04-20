import express, { Application, Response, NextFunction } from "express";
import cors from "cors";
import { ItemRoutes, UserRoutes, VendorRoutes, PaymentRoutes } from "../routes";
import cookieParser from 'cookie-parser';

export default async (app: Application) => {
    app.use(cors({
        credentials: true,
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://pinoycart-server.vercel.app/', 'https://pinoycart-server.vercel.app'] // Add your local frontend URLs
    }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/uploads', express.static('uploads'));

    app.use("/api/v1", [UserRoutes, VendorRoutes, ItemRoutes, PaymentRoutes]);

    // Set CORS headers for all routes
    app.use((req, res: Response, next: NextFunction) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        next();
    });

    return app;
};
