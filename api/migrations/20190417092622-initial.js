export const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user', {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
        },
        email: Sequelize.STRING,
        password: Sequelize.STRING,
        isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
        createdAt: { allowNull: false, type: Sequelize.DATE },
        updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('book', {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
        },
        title: Sequelize.STRING,
        writerId: {
            type: Sequelize.UUID,
            references: {
                model: 'user',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },
        createdAt: { allowNull: false, type: Sequelize.DATE },
        updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
};

export const down = async (queryInterface) => {
    await queryInterface.dropTable('book');
    await queryInterface.dropTable('user');
};
