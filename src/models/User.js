import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('superadmin', 'admin', 'user'),
            allowNull: false,
            defaultValue: 'user'
        }
    }, {
        tableName: 'users',
        timestamp: true
    }
)
export default User;