const { Given, Then, When } = require('cucumber');
const { By } = require('selenium-webdriver');
const expect = require('expect');

Given('I am on Home page', async function () {
    await this.driver.get(this.host);
});

When('I do nothing', function () {
    return true;
});

Then('Hello world is displayed on home page', async function () {
    const welcomeHome = await this.driver.findElement(By.id('hello-world')).getText();

    expect(welcomeHome).toEqual('hello world');
});
