import { Sequelize } from "sequelize";
import { config } from "dotenv";

// Cargar variables de entorno desde .env
config();

// Definir un tipo para las variables de entorno esperadas
interface DatabaseEnvVars {
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD?: string;
  DB_HOST: string;
  DB_PORT?: string;
}

// Validar que las variables de entorno estén definidas
const getEnv = (): DatabaseEnvVars => {
  const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;
  if (!DB_NAME || !DB_USER || !DB_HOST) {
    throw new Error(
      "[HOSTLY]:[MYSQL CONNECTION]: Faltan variables de entorno en el archivo .env",
    );
  }
  return { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT };
};

// Obtener variables de entorno
const env = getEnv();

// Configurar Sequelize
const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT ? parseInt(env.DB_PORT, 10) : 3306,
  dialect: "mysql",
  logging: false,
});

// Autenticar conexión
sequelize
  .authenticate()
  .then(() => {
    console.log("[HOSTLY]:[MYSQL CONNECTION]: Conexión establecida con éxito.");
  })
  .catch((err: unknown) => {
    console.error(
      "[HOSTLY]:[MYSQL CONNECTION]: No se pudo conectar a la base de datos:",
      err,
    );
  });

export default sequelize;
