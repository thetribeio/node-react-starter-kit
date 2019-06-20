const { After, Before } = require('cucumber');
const SauceLabs = require('saucelabs').default;

const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');
const safari = require('selenium-webdriver/safari');

const { SAUCELABS_ACCESS_KEY, SAUCELABS_HOST, SAUCELABS_USER } = process.env;

const capabilities = {
    ie: {
        browserName: 'internet explorer',
        iedriverVersion: '3.14.0',
        seleniumVersion: '3.14.0',
        version: '11.285',
    },
    chrome: {
        browserName: 'chrome',
        screenResolution: '1920x1200',
    },
    firefox: {
        browserName: 'firefox',
    },
    safari: {
        browserName: 'safari',
        screenResolution: '1920x1440',
    },
};

const getBrowser = (browser) => () => new Builder()
    .withCapabilities({
        username: SAUCELABS_USER,
        accessKey: SAUCELABS_ACCESS_KEY,
        host: SAUCELABS_HOST,
        port: 4445,
        implicit: 5000,
        ...capabilities[browser],
    })
    .usingServer(`http://${SAUCELABS_USER}:${SAUCELABS_ACCESS_KEY}@${SAUCELABS_HOST}:4445/wd/hub`)
    .build();

const getLocalBrowser = (browser, display) => {
    let options = null;
    let optionsFunc = null;

    switch (browser) {
        case 'chrome':
            options = new chrome.Options();
            optionsFunc = 'setChromeOptions';
            break;
        case 'safari':
            options = new safari.Options();
            optionsFunc = 'setSafariOptions';
            break;
        default:
            options = new firefox.Options();
            optionsFunc = 'setFirefoxOptions';
            break;
    }

    if (!display) {
        options.headless();
    }

    const builder = new Builder();

    return builder[optionsFunc](options)
        .forBrowser(browser)
        .build();
};

Before(async function () {
    if (this.local) {
        this.driver = getLocalBrowser(this.browser, this.display);
    } else {
        this.driver = getBrowser(this.browser);
    }
});

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
