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
