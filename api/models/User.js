import DataTypes from 'sequelize';
import sequelize from './sequelize';

const User = sequelize.define('user', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

User.associate = ({ Book }) => {
    User.hasMany(Book, { foreignKey: 'writerId' });
};

export default User;
