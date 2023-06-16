import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import router from "./routes/Routes";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static("./images"));

app.get("/", (req: Request, res: Response) => {
    return res.status(200).send({
        response: "Express TypeScript",
    });
});

app.use(router);

app.listen(process.env.PORT, () => {
    console.log(`${process.env.APP_NAME} running on port ${process.env.PORT}`);
});
