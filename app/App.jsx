import { createBrowserHistory } from 'history';
import PropTypes from 'prop-types';
import React, { PureComponent, createContext, useContext } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Routes from '@app/Routes';
import createStore from '@app/createStore';

import './App.css';

export const AppDataContext = createContext({});

export const useAppData = () => useContext(AppDataContext);

class App extends PureComponent {
    constructor(props) {
        super(props);

        this.history = createBrowserHistory();
        this.store = createStore({}, { history: this.history, appData: props.appData });
    }

    render() {
        const { appData } = this.props;

        return (
            <AppDataContext.Provider value={appData}>
                <Provider store={this.store}>
                    <Router history={this.history}>
                        <Routes />
                    </Router>
                </Provider>
            </AppDataContext.Provider>
        );
    }
}

App.propTypes = {
    appData: PropTypes.shape({}).isRequired,
};

export default App;
