import express, { Application } from "express";
import cors from "cors";
import { ItemRoutes, UserRoutes, VendorRoutes, PaymentRoutes } from "../routes";
import cookieParser from 'cookie-parser';

export default async (app: Application) => {
    // Configure CORS middleware for all routes
    app.use(cors({
        origin: 'https://pinoycart-client.vercel.app', // Only allow this specific origin
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Ensure OPTIONS is included
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
        credentials: true,  // Necessary if you're sending credentials like cookies
        optionsSuccessStatus: 200  // Some legacy browsers (IE11, various SmartTVs) choke on 204
    }));
    

    // Middleware for cookies and body parsing
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.options('*', cors()); // Include before your other routes

    app.use((req, res, next) => {
        console.log('Request Type:', req.method);
        console.log('Request URL:', req.url);
        console.log('Request Headers:', req.headers);
        next();
    });


    // Simple root route
    app.get("/", (req, res) => {
        res.json({ message: "Welcome to the API" });
    });

    // API routes
    app.use("/api/v1", [UserRoutes, VendorRoutes, ItemRoutes, PaymentRoutes]);

    return app;
};
