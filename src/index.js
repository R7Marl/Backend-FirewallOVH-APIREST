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
app.use(cors({
  origin: '*',  // No como array, sino como string
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
database.sync({ alter: true }).then(() => {
    console.log('[HOSTLY ECOMMERCE]:[DATABASE]: Base de datos sincronizada con éxito.');
  }).catch(err => console.error('[HOSTLY ECOMMERCE]:[DATABASE]: Error sincronizando la base de datos:', err));
appRoutes(app);
app.listen(process.env.PORT);
console.log("Servidor encendido en el puerto 3000");