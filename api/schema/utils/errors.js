import { ValidationError } from 'sequelize';

export class HandledError {
    constructor(error) {
        this.errors = Array.isArray(error) ? error : [error];
    }
}

export const withHandledErrors = (next) => (...args) => next(...args)
    .catch((error) => {
        if (error instanceof HandledError) {
            // transform the rejection into a resolved promise
            return error;
        }

        // throw back the exception
        return Promise.reject(error);
    });

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
