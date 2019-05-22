const { After } = require('cucumber');
const SauceLabs = require('saucelabs').default;

const { SAUCELABS_ACCESS_KEY, SAUCELABS_USER } = process.env;

After(async function ({ pickle: { name }, result: { status } }) {
    const sauceApi = new SauceLabs({ user: SAUCELABS_USER, key: SAUCELABS_ACCESS_KEY });
    // eslint-disable-next-line no-underscore-dangle
    const jobId = (await this.driver.getSession()).id_;
    const passed = 'passed' === status;
    sauceApi.updateJob(SAUCELABS_USER, jobId, {
        name: `${this.browser} - ${name}`,
        passed,
    });
    this.driver.quit();
    if (!passed) {
        console.log(`Failed test video: https://app.saucelabs.com/tests/${jobId}`);
    }
});
