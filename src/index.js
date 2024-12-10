import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import appRoutes from "./routes/index.routes.js";
import database from "./config/database.js";
console.log(process.env.APP_KEY);

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
database.sync({ alter: true }).then(() => {
    console.log('[HOSTLY ECOMMERCE]:[DATABASE]: Base de datos sincronizada con éxito.');
  }).catch(err => console.error('[HOSTLY ECOMMERCE]:[DATABASE]: Error sincronizando la base de datos:', err));
appRoutes(app);
app.listen(3000);
console.log("Servidor encendido en el puerto 3000");
