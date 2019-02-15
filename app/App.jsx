import { createBrowserHistory } from 'history';
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import createStore from './createStore';
import Routes from './Routes';

class App extends PureComponent {
    constructor(props) {
        super(props);

        this.history = createBrowserHistory();
        this.store = createStore({}, { history: this.history });
    }

    render() {
        return (
            <Provider store={this.store}>
                <Router history={this.history}>
                    <Routes />
                </Router>
            </Provider>
        );
    }
}

export default App;
