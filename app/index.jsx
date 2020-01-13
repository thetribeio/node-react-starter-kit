import * as Sentry from '@sentry/browser';
import React from 'react';
// we can safely allow the dev dependency for deepForceUpdate
// on production, webpack will nullify it
// eslint-disable-next-line import/no-extraneous-dependencies
import deepForceUpdate from 'react-deep-force-update';
import { render } from 'react-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// get the container
const container = document.getElementById('app');

// get app data sent by the back
const appData = JSON.parse(container.dataset.app);

Sentry.init({
    dsn: appData.sentryDsn,
    environment: appData.sentryEnv,
});

let appInstance = null;

// Re-render the app when window.location changes
const renderApp = () => {
    try {
        let appElement = <App appData={appData} />;

        if (!__DEV__) {
            appElement = (
                <ErrorBoundary>
                    {appElement}
                </ErrorBoundary>
            );
        }

        // render it
        appInstance = render(appElement, container);
    } catch (error) {
        if (__DEV__) {
            throw error;
        }

        console.error(error);
    }
};

renderApp();

// Enable Hot Module Replacement (HMR)
if (module.hot) {
    module.hot.accept('./App', () => {
        if (appInstance && appInstance.updater.isMounted(appInstance)) {
            // Force-update the whole tree, including components that refuse to update
            deepForceUpdate(appInstance);
        }

        renderApp();
    });
}
