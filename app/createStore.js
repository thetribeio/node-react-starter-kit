import { applyMiddleware, createStore, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from '@app/reducers';

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default (initialState = {}, extraArguments = null) => createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(
        thunkMiddleware.withExtraArgument(extraArguments),
    )),
);
