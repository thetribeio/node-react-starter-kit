import { ValidationError } from 'sequelize';

export const transformSequelizeErrors = (next) => (...args) => next(...args)
    .catch((error) => {
        if (error instanceof ValidationError) {
            const errors = error.errors.map(({ message, path }) => ({
                message,
                path,
            }));

            return Promise.reject(new HandledError(errors));
        }

        return Promise.reject(error);
    });
