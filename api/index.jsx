import path from 'path';
import React from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import express from 'express';
import PrettyError from 'pretty-error';
import history from 'connect-history-api-fallback';
import App from '@app/App';
import Html from './components/Html';
import exampleController from './controllers/exampleController';
// eslint-disable-next-line import/no-unresolved
import manifest from './chunk-manifest.json';

// appData to provide through the index.html
// can be used to send environment settings to front
const appData = {
    sentryDsn: process.env.SENTRY_PUBLIC_DSN,
    sentryEnv: process.env.SENTRY_ENVIRONMENT,
};

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

// then fallback
server.use(history());

// serve it
server.get('*', (req, res, next) => {
    try {
        const app = <App appData={appData} />;
        const body = renderToString(app);

        const html = renderToStaticMarkup(
            <Html
                appData={appData}
                manifest={manifest.client}
            >
                {body}
            </Html>,
        );

        res.setHeader('Cache-Control', 'max-age=0, no-cache');
        res.send(`<!doctype html>${html}`);
    } catch (error) {
        next(error);
    }
});

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
