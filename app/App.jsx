import { createBrowserHistory } from 'history';
import React, { PureComponent, createContext, useContext } from 'react';
import { ApolloProvider } from 'react-apollo';
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

        const initialState = process.env.BROWSER ? window.State.redux : {};

        this.store = createStore(initialState, {
            history: this.history,
            appData: props.appData,
            apolloClient: props.apolloClient,
        });

        if (props.onCreateStore) {
            // we need to give back the store pointer
            props.onCreateStore(this.store);
        }
    }

    render() {
        const { appData, apolloClient } = this.props;

        return (
            <ApolloProvider client={apolloClient}>
                <AppDataContext.Provider value={appData}>
                    <Provider store={this.store}>
                        <RouterComponent history={this.history}>
                            <Routes />
                        </RouterComponent>
                    </Provider>
                </AppDataContext.Provider>
            </ApolloProvider>
        );
    }
}

App.propTypes = {
    appData: PropTypes.shape({}).isRequired,
    apolloClient: PropTypes.shape({}).isRequired,
    onCreateStore: PropTypes.func,
};

export default App;
