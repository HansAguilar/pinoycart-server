import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';  // Import rate-limiting package
import { ItemRoutes, UserRoutes, VendorRoutes, PaymentRoutes } from "../routes";

export default async (app: Application): Promise<Application> => {
    // Enable CORS with specific settings
    app.use(cors({
        origin: '*', // Allows all domains; consider restricting in production
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
        credentials: true, // Enable sending of credentials over CORS
        optionsSuccessStatus: 200 // Compatibility for legacy browsers
    }));

    // Enable pre-flight across-the-board
    app.options('*', cors());

    // Apply rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per window (15 minutes)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });

    // Apply the rate limiter to all requests
    app.use(limiter);

    // Middleware for parsing cookies
    app.use(cookieParser());

    // Middleware for parsing application/json
    app.use(express.json());

    // Middleware for parsing application/x-www-form-urlencoded
    app.use(express.urlencoded({ extended: true }));

    // Simple logger for this example
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.log('Request Type:', req.method);
        console.log('Request URL:', req.url);
        console.log('Request Headers:', req.headers);
        next();
    });

    // Root route
    app.get("/", (req: Request, res: Response) => {
        res.json({ message: "Welcome to the API" });
    });

    // Group API routes
    app.use("/api/v1", [UserRoutes, VendorRoutes, ItemRoutes, PaymentRoutes]);

    return app;
};
