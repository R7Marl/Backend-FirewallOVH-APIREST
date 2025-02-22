import "dotenv/config";
import express from "express";
import database from "./config/database";
import cors from "cors";
import setupRoutes from "./routes/index.routes";
import i18n from "i18next";
import Backend from "i18next-fs-backend";
import { handle, LanguageDetector } from "i18next-http-middleware";
import path from "path";
i18n
  .use(Backend)
  .use(LanguageDetector)
  .init({
    backend: {
      loadPath: path.join("src/locales", "{{lng}}.json"),
    },
    fallbackLng: "en",
    preload: ["en", "es"],
    detection: {
      order: ["querystring", "cookie", "header"],
      lookupHeader: "content-language",
      lookupCookie: "i18next",
      caches: ["cookie"],
      cookieOptions: { path: "/", sameSite: "Lax", maxAge: 365 * 24 * 60 * 60 },
    },
    supportedLngs: ["en", "es"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
  });

const app = express();
app.use(handle(i18n));
app.use(express.json());
//app.use(cors())
app.use(cors({
    origin: 'https://firewall.hostly.network',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Authorization', 'Cache-Control', 'Content-Type', 'DNT', 'If-Modified-Since', 'Keep-Alive', 'Origin', 'User-Agent', 'X-Requested-With']
}));
app.use(express.urlencoded({ extended: true }));

database.sync().then(() => {
    console.log('[HOSTLY ECOMMERCE]:[DATABASE]: Base de datos sincronizada con éxito.');
}).catch(err => console.error('[HOSTLY ECOMMERCE]:[DATABASE]: Error sincronizando la base de datos:', err));

setupRoutes(app);

app.listen(process.env.PORT, () => {
    console.log(`Servidor encendido en el puerto ${process.env.PORT}`);
});
