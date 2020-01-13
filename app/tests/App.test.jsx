import React, { useContext } from 'react';
import { ReactReduxContext } from 'react-redux';
import { withRouter } from 'react-router-dom';
import TestRenderer from 'react-test-renderer';
import App from '../App';

// mock the Routes component's module
jest.mock('../Routes');

afterEach(() => {
    // reset the mock after each test
    // eslint-disable-next-line global-require
    require('../Routes').default.mockReset();
});

test('App provide a redux context', () => {
    // get the Routes component
    // eslint-disable-next-line global-require
    const Routes = require('../Routes').default;

    // mock its implemantion
    Routes.mockImplementation(() => {
        const context = useContext(ReactReduxContext);

        // the redux context must be defined
        expect(context).toBeDefined();
        expect(context).not.toBeNull();

        return null;
    });

    // render the app
    TestRenderer.create(<App appData={{}} />);

    // ensure the Routes component has been rendered at least once
    expect(Routes.mock.calls.length).toBeGreaterThan(0);
});

test('App provide a router context', () => {
    // get the Routes component
    // eslint-disable-next-line global-require
    const Routes = require('../Routes').default;

    // create a fake Component
    const FakeComponent = jest.fn(() => null);

    // mock its implementation
    Routes.mockImplementation(withRouter(FakeComponent));

    // render the app
    TestRenderer.create(<App appData={{}} />);

    // ensure the Routes component has been rendered at least once
    expect(Routes.mock.calls.length).toBeGreaterThan(0);

    // ensure the router context is available
    expect(FakeComponent.mock.calls[0][0]).toMatchObject({
        match: {},
        location: {},
        history: {},
    });
});
