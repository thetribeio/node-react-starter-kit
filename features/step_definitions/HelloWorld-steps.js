import { Given, Then, When } from 'cucumber';

Given('I am on Home page', async function () {
    this.page = this.pageFactory.create('Home');
    await this.page.loadAndWaitUntilVisible();
});

When(/I press the button/, async function () {
    await this.page.clickButton();
});

Then(/"(.*)" is displayed in Home page/, async function (text) {
    await this.page.assertTextInClickMe(text);
});
