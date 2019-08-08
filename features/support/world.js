/* eslint-disable func-names */
import { setDefaultTimeout, setWorldConstructor } from 'cucumber';
import Factory from '../pages/Factory';

setDefaultTimeout(60 * 1000);

const World = function World(args) {
    this.browser = args.parameters.browser;
    this.local = args.parameters.local;
    this.display = args.parameters.display;
    this.pageFactory = new Factory(this);

    if (args.parameters.local) {
        this.host = 'http://localhost:3000';
    } else {
        this.host = 'http://app.local:3000';
    }
};

setWorldConstructor(World);
