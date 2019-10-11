import User from './User';
import Book from './Book';

const models = { User, Book };

Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);

        // eslint-disable-next-line no-param-reassign
        delete model.associate;
    }
});

export { User, Book };
