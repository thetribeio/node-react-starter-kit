const { Given, Then, When } = require('cucumber');
const { By } = require('selenium-webdriver');
const expect = require('expect');

Given('I am on Home page', async function () {
    await this.driver.get(this.host);
});

When(/I press "(.*)"/, async function (id) {
    await this.driver.findElement(By.id(id)).click();
});

Then(/"(.*)" is displayed within "(.*)"/, async function (text, id) {
    const buttonText = await this.driver.findElement(By.id(id)).getText();

    expect(buttonText).toEqual(text);
});
