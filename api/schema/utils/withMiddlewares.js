const applyMiddlewares = (...middlewares) => {
    const [middleware, ...nexts] = middlewares;

    if (nexts.length) {
        return middleware(applyMiddlewares(...nexts));
    }

    // the last middleware is in fact the real resolver
    return middleware;
};

export default applyMiddlewares;
