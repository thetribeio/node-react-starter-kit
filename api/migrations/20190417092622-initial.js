export const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user', {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
        },
        email: { type: Sequelize.STRING, unique: true },
        password: Sequelize.STRING,
        is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
        created_at: { allowNull: false, type: Sequelize.DATE },
        updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('book', {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
        },
        title: Sequelize.STRING,
        writer_id: {
            type: Sequelize.UUID,
            references: {
                model: 'user',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },
        created_at: { allowNull: false, type: Sequelize.DATE },
        updated_at: { allowNull: false, type: Sequelize.DATE },
    });
};

export const down = async (queryInterface) => {
    await queryInterface.dropTable('book');
    await queryInterface.dropTable('user');
};
