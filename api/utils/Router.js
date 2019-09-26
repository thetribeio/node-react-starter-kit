import express from 'express';

const methods = ['delete', 'get', 'patch', 'post', 'put'];

const decorateMethod = (router, method) => {
    // Save the original method before decorating it
    const originalMethod = router[method];

    // eslint-disable-next-line func-names, no-param-reassign
    router[method] = function (path, ...middlewares) {
        // Decorate the middlewares
        const decoratedMiddlewares = middlewares.flat(Infinity).map((middleware) => {
            // Don't decorate error handlers
            if (4 === middleware.length) {
                return middleware;
            }

            return (req, res, next) => {
                const result = middleware(req, res, next);

                if (result instanceof Promise) {
                    result.catch(next);
                }
            };
        });

        // Call the original method
        return originalMethod.apply(this, [path, ...decoratedMiddlewares]);
    };
};

/**
 * Decorated express Router that automatically catch errors.
 *
 * This will be removable once we upgrade to express 5 (which is still in alpha).
 */
function Router(...args) {
    const router = express.Router(...args);

    for (const method of methods) {
        decorateMethod(router, method);
    }

    return router;
}

export default Router;
