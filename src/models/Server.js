import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Server = sequelize.define(
    'Server',
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
        ipBlock: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: false
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        }
    },
    {
        tableName: 'servers',
        timestamps: true
    }
);

export default Server;
