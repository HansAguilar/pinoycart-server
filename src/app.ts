import express from "express";
import ExpressApp from "./services/ExpressApp";
import Database from "./services/Database";

const app = express();
const port = 3000;
//
const StartServer = async () => {

    await Database();
    await ExpressApp(app);

    app.listen(port, "0.0.0.0", () => {
        console.log("Server running");
    })
};

StartServer();
export default app