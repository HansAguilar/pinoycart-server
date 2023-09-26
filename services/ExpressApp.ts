import express, { Application } from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";

import { ItemRoutes, UserRoutes, VendorRoutes } from "../routes";


export default async (app: Application) => {
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    app.use("/api/v1", [UserRoutes, VendorRoutes, ItemRoutes]);

    return app;
};


