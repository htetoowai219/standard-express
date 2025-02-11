import express from "express";
import cors from "cors";
import router from "./routes/test.js";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.js";
import updateRouter from "./routes/updateInfo.js";

const app = express();

app.use(
    cors({
        origin: process.env.origin,
        credentials: true,
    })
);

app.use(express.json({ limit : "16kb" }));
app.use(express.urlencoded( { extended : true, limit : "16kb" }));
app.use(express.static("public"));

app.use(cookieParser());

app.use("/test", router);
app.use("/api/v1/", authRouter);
app.use("/api/v1/update/", updateRouter);

export {app};