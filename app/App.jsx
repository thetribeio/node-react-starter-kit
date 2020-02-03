import { createBrowserHistory } from 'history';
import PropTypes from 'prop-types';
import React, { PureComponent, createContext, useContext, Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import createStore from '@app/createStore';
import i18n from '@app/i18n';
import Routes from '@app/Routes';
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
                <I18nextProvider i18n={i18n}>
                    <Suspense fallback={() => <div>loading...</div>}>
                        <Provider store={this.store}>
                            <Router history={this.history}>
                                <Routes />
                            </Router>
                        </Provider>
                    </Suspense>
                </I18nextProvider>
            </AppDataContext.Provider>
        );
    }
}

App.propTypes = {
    appData: PropTypes.shape({}).isRequired,
};

export default App;
