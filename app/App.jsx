import { createBrowserHistory } from 'history';
import React, { PureComponent, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router, StaticRouter } from 'react-router-dom';
import createStore from './createStore';
import Routes from './Routes';
import './App.css';

export const AppDataContext = createContext({});

export const useAppData = () => useContext(AppDataContext);

const RouterComponent = process.env.BROWSER ? Router : StaticRouter;

class App extends PureComponent {
    constructor(props) {
        super(props);

        this.history = process.env.BROWSER && createBrowserHistory();
        this.store = createStore({}, { history: this.history, appData: props.appData });
    }

    render() {
        const { appData } = this.props;

        return (
            <AppDataContext.Provider value={appData}>
                <Provider store={this.store}>
                    <RouterComponent history={this.history}>
                        <Routes />
                    </RouterComponent>
                </Provider>
            </AppDataContext.Provider>
        );
    }
}

App.propTypes = {
    appData: PropTypes.shape({}).isRequired,
};

export default App;
