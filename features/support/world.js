/* eslint-disable func-names */
const { setDefaultTimeout, setWorldConstructor } = require('cucumber');

setDefaultTimeout(60 * 1000);

const World = function World(args) {
    this.browser = args.parameters.browser;
    this.local = args.parameters.local;
    this.display = args.parameters.display;

    if (args.parameters.local) {
        this.host = 'http://localhost:3000';
    } else {
        this.host = 'http://app.local:3000';
    }
};

setWorldConstructor(World);
