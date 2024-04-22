import express, { Application } from "express";
import cors from "cors";
import { ItemRoutes, UserRoutes, VendorRoutes, PaymentRoutes } from "../routes";
import cookieParser from 'cookie-parser';

export default async (app: Application) => {
    // Configure CORS middleware for all routes
    app.use(cors({
        origin: '*', // Adjust the origin as per your requirements or based on environment
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Ensure OPTIONS is included
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
        // If your client needs to send cookies with requests
        preflightContinue: false,  // Don't pass the request to next router if the preflight request is successful
        optionsSuccessStatus: 200  // Some legacy browsers (IE11, various SmartTVs) choke on 204
    }));

    // Middleware for cookies and body parsing
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // API routes
    app.use("/api/v1", [UserRoutes, VendorRoutes, ItemRoutes, PaymentRoutes]);

    // Simple root route
    app.get("/", (req, res) => {
        res.json({ message: "Welcome to the API" });
    });

    return app;
};
