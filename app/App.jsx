import { createBrowserHistory } from 'history';
import React, { PureComponent, createContext, useContext } from 'react';
import { ApolloProvider } from 'react-apollo';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import createStore from './createStore';
import Routes from './Routes';
import './App.css';

export const AppDataContext = createContext({});

export const useAppData = () => useContext(AppDataContext);

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
        const { appData, apolloClient, routerComponent: Router } = this.props;

        return (
            <ApolloProvider client={apolloClient}>
                <AppDataContext.Provider value={appData}>
                    <Provider store={this.store}>
                        <Router history={this.history}>
                            <Routes />
                        </Router>
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
    routerComponent: PropTypes.func.isRequired,
};

export default App;
