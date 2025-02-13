import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
config();
const sequelize = new Sequelize(
process.env.DB_NAME || 'hostly_fw',
process.env.DB_USER || 'root',
process.env.DB_PASSWORD || '', {
host: process.env.DB_HOST || 'localhost',
port: 3306,
dialect: 'mysql',
logging: false
});
sequelize.authenticate()
  .then(() => {
    console.log('[HOSTLY]:[MYSQL CONNECTION]: Conexión establecida con éxito.');
  })
  .catch(err => {
    console.error('[HOSTLY]:[MYSQL CONNECTION]: No se pudo conectar a la base de datos:', err);
  });

export default sequelize;