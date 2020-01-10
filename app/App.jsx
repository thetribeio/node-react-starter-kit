import { createBrowserHistory } from 'history';
import React, { PureComponent, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import createStore from '@app/createStore';
import Routes from '@app/Routes';
import '@app/App.css';

export const AppDataContext = createContext({});

export const useAppData = () => useContext(AppDataContext);

class App extends PureComponent {
    constructor(props) {
        super(props);

        this.history = createBrowserHistory();

        this.store = createStore({}, {
            history: this.history,
            appData: props.appData,
            apolloClient: props.apolloClient,
        });
    }

    render() {
        const { appData, apolloClient } = this.props;

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
};

export default App;
