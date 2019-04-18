import User from './User';
import Book from './Book';

const models = { User, Book };

Object.keys(models).forEach((modelName) => {
    const model = models[modelName];

    if (model.associate) {
        model.associate(models);

        delete model.associate;
    }
});

export { User, Book };
