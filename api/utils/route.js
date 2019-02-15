const route = (handler) => (req, res, next) => handler(req, res, next).catch(next);

export default route;
