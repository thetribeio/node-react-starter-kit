import expect from 'expect';
import { By, until } from 'selenium-webdriver';
import Base from './Base';

class Home extends Base {
    load() {
        this.driver.get(this.host);
    }

    waitUntilVisible() {
        return this.driver.wait(until.titleIs('theTribe'));
    }

    async assertTextInClickMe(text) {
        const btnText = await this.driver.findElement(By.id('click-me')).getText();
        expect(btnText).toBe(text);
    }

    clickButtonById(id) {
        return this.driver.findElement(By.id(id)).click();
    }
}

export default Home;
