import DataTypes from 'sequelize';
import sequelize from './sequelize';

const Book = sequelize.define('book', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    title: DataTypes.STRING,
});

Book.associate = ({ User }) => {
    Book.belongsTo(User, {
        foreignKey: { name: 'writerId', allowNull: false },
        as: 'writer',
    });
};

export default Book;
