import React from 'react';
import { render } from 'react-dom';
// we can safely allow the dev dependency for deepForceUpdate
// on production, webpack will nullify it
// eslint-disable-next-line import/no-extraneous-dependencies
import deepForceUpdate from 'react-deep-force-update';
import App from './App';

// get the container
const container = document.getElementById('app');

let appInstance = null;

// Re-render the app when window.location changes
const renderApp = () => {
    try {
        // render it
        appInstance = render(<App />, container);
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
