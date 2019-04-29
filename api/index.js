import path from 'path';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import express from 'express';
import PrettyError from 'pretty-error';
import history from 'connect-history-api-fallback';
import exampleController from './controllers/exampleController';

/* configure Sentry */
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT,
});

/* configure the express server */
const server = express();

// the first middleware must be the sentry request handler
server.use(Sentry.Handlers.requestHandler());

// set CORS and JSON middleware
server.use(cors());
server.use(express.json());

// serve public files
const statics = express.static(path.resolve(__dirname, 'public'));
server.use(statics);

// controllers
server.use('/example', exampleController);

if (!module.hot) {
    // fallback history for SPA
    server.use(history(), statics);
}

// Use the sentry error handler before any other error handler
server.use(Sentry.Handlers.errorHandler());

// then prepare pretty error to log our errors
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

// then here comes our error handler
// eslint-disable-next-line no-unused-vars
server.use((err, req, res, next) => {
    console.error(pe.render(err));
    res.status('500').send('Internal error');
});

// on production mode (without the HOT module) we start ourselves the web server
if (!module.hot) {
    const port = process.env.PORT || 3000;

    server.listen(port, () => {
        console.info(`The server is running at http://localhost:${port}/`);
    });
}

// share the HOT module on export
if (module.hot) {
    server.hot = module.hot;
}

// export the web server
export default server;
