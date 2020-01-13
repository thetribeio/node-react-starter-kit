import Book from './Book';
import User from './User';

const models = { Book, User };

Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);

        // eslint-disable-next-line no-param-reassign
        delete model.associate;
    }
});

export { Book, User };
