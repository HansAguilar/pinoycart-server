import express, { Application } from "express";
import cors from "cors";
import { ItemRoutes, UserRoutes, VendorRoutes, PaymentRoutes } from "../routes";

export default async (app: Application) => {
    app.use(cors({
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        origin: 'http://localhost:5173',
    })); //! this solves the cors problem in frontend
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/uploads', express.static('uploads'));

    app.use("/api/v1", [UserRoutes, VendorRoutes, ItemRoutes, PaymentRoutes]);

    return app;
};