import { until } from 'selenium-webdriver';

export default class Base {
    constructor(World) {
        this.browser = World.browser;
        this.driver = World.driver;
        this.host = World.host;
    }

    loadAndWaitUntilVisible() {
        this.load();

        return this.waitUntilVisible();
    }

    waitUntilElementIsVisible(locator) {
        const element = this.driver.wait(until.elementLocated(locator));

        return this.driver.wait(until.elementIsVisible(element));
    }
}
