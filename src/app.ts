import express from "express";
import ExpressApp from "./services/ExpressApp";
import Database from "./services/Database";

const StartServer = async () => {
    const app = express();

    await Database();
    await ExpressApp(app);

    app.listen(3000, () => {
        console.log("Server running");
    })
};

StartServer();