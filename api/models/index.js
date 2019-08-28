import User from './User';
import Book from './Book';

const models = { User, Book };

Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);

        delete model.associate;
    }
});

export { User, Book };
