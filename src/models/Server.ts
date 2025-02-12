import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface ServerAttributes {
  id: string;
  name: string;
  ipBlock: string;
  ip: string;
  status: 'active' | 'inactive';
  userId: string | null; 
}

interface ServerInstance
  extends Model<ServerAttributes>, ServerAttributes {}

interface ServerCreationAttributes extends Optional<ServerAttributes, 'id'> {}

const Server = sequelize.define<ServerInstance, ServerAttributes>('Server', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ipBlock: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'servers',
  timestamps: true,
});

export default Server;
