import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './routes/Home';

const Routes = () => (
    <Switch>
        <Route component={Home} path="/" exact />
    </Switch>
);

export default Routes;
