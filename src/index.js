import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import appRoutes from "./routes/index.routes.js";
console.log(process.env.APP_KEY);

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(appRoutes);
app.listen(3000);
console.log("Servidor encendido en el puerto 3000");
