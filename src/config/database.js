import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
config();
const sequelize = new Sequelize(
process.env.DB_NAME,
process.env.DB_USER,
process.env.DB_PASSWORD, {
host: process.env.DB_HOST,
dialect: 'mysql'
});
sequelize.authenticate()
  .then(() => {
    console.log('[HOSTLY]:[MYSQL CONNECTION]: Conexión establecida con éxito.');
  })
  .catch(err => {
    console.error('[HOSTLY]:[MYSQL CONNECTION]: No se pudo conectar a la base de datos:', err);
  });

export default sequelize;