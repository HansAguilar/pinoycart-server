import app from "../src/app";

app.get("/hello", (req, res) => {
    return res.status(200).json({ message: "Hello!" });
})

export default app;