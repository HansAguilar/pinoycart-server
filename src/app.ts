import express from "express";
import ExpressApp from "./services/ExpressApp";
import Database from "./services/Database";

const app = express();

const StartServer = async () => {

    await Database();
    await ExpressApp(app);

    app.listen(3000, () => {
        console.log("Server running");
    })
};

StartServer();
export default app