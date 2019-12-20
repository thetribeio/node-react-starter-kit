import path from 'path';
import * as Sentry from '@sentry/node';
import history from 'connect-history-api-fallback';
import cors from 'cors';
import express from 'express';
import PrettyError from 'pretty-error';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Html from '@api/components/Html';
import exampleController from '@api/controllers/exampleController';

const getManifest = () => {
    if (__DEV__) {
        // eslint-disable-next-line global-require, import/no-extraneous-dependencies
        return require('import-fresh')('./chunk-manifest.json');
    }

    // eslint-disable-next-line global-require, import/no-unresolved
    return require('./chunk-manifest.json');
};

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

const renderHtml = () => {
    // get the manifest (and support async manifest updates on dev mode)
    const { client: manifest } = getManifest();

    // prepare the html for index.html
    const element = createElement(Html, {
        appData,
        manifest,
    });

    return `<!doctype html>${renderToStaticMarkup(element)}`;
};

let getHtml;

if (__DEV__) {
    // on development we always render html on request
    getHtml = renderHtml;
} else {
    // on production we render the html once only
    const html = renderHtml();

    getHtml = () => html;
}

// serve it
server.get('/index.html', (req, res) => {
    res.setHeader('Cache-Control', 'max-age=0, no-cache');
    res.send(getHtml());
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
    res.status('500')
        .send('Internal error');
});

// on production mode we start ourselves the web server
if (!__DEV__) {
    const port = process.env.PORT || 3000;

    server.listen(port, () => {
        console.info(`The server is running at http://localhost:${port}/`);
    });
}

// export the web server
export default server;
