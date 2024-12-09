import User from './User.js';
import Server from './Server.js';

User.hasMany(Server, {
    foreignKey: 'userId',
    as: 'servers'
});

Server.belongsTo(User, {
    foreignKey: 'userId',
    as: 'owner'
});

export { User, Server };

