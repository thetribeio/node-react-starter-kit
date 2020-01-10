import path from 'path';
import React from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { getDataFromTree } from 'react-apollo';
import * as Sentry from '@sentry/node';
import history from 'connect-history-api-fallback';
import cors from 'cors';
import express from 'express';
import expressGraphQL from 'express-graphql';
import { formatError } from 'graphql';
import PrettyError from 'pretty-error';
import { StaticRouter } from 'react-router-dom';
import Html from '@api/components/Html';
import initLoaders from '@api/loaders';
import schema from '@api/schema';
import createApolloClient from '@api/utils/createApolloClient';
import App from '@app/App';

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

const generateApolloSettings = (request) => ({
    schema,
    rootValue: { request },
    context: { loaders: initLoaders(request), request },
});

// graphql endpoint
server.use(
    '/graphql',
    expressGraphQL((request) => ({
        graphiql: __DEV__,
        pretty: __DEV__,
        ...generateApolloSettings(request),
        customFormatErrorFn: (error) => {
            // first log the error in stderr
            console.error(error);

            // log the error with sentry
            Sentry.captureException(error);

            return formatError(error);
        },
    })),
);

// then fallback
server.use(history());

// serve it
server.get('*', async (req, res, next) => {
    try {
        // create the apollo client
        const apolloClient = createApolloClient(generateApolloSettings(req));
        // we don't have the redux store yet
        // create a callback to retrieve it
        const onCreateStore = (instance) => {
            onCreateStore.store = instance;
        };

        const Router = (props) => <StaticRouter location={req.originalUrl} {...props} />;

        const app = (
            <App
                appData={appData}
                onCreateStore={onCreateStore}
                apolloClient={apolloClient}
                routerComponent={Router}
            />
        );

        await getDataFromTree(app);

        const body = renderToString(app);

        const { client: manifest } = getManifest();

        const html = renderToStaticMarkup(
            <Html
                appData={appData}
                manifest={manifest}
                state={{ apollo: apolloClient.extract(), redux: onCreateStore.store.getState() }}
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
