import "dotenv/config";
import express from "express";
import appRoutes from "./routes/index.routes.js";
import database from "./config/database.js";
import cors from "cors";
console.log(process.env.APP_KEY);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(cors());
database.sync({ alter: true }).then(() => {
    console.log('[HOSTLY ECOMMERCE]:[DATABASE]: Base de datos sincronizada con éxito.');
  }).catch(err => console.error('[HOSTLY ECOMMERCE]:[DATABASE]: Error sincronizando la base de datos:', err));
appRoutes(app);
app.listen(process.env.PORT);
console.log("Servidor encendido en el puerto " + process.env.PORT);