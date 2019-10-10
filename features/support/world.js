import { setDefaultTimeout, setWorldConstructor } from 'cucumber';
import Factory from '../pages/Factory';

setDefaultTimeout(60 * 1000);

class World {
    constructor(args) {
        this.browser = args.parameters.browser;
        this.local = args.parameters.local;
        this.display = args.parameters.display;
        this.pageFactory = new Factory(this);
        this.host = 'http://app.local:3000';
    }
}

setWorldConstructor(World);
