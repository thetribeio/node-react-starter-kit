/* eslint-disable func-names */
const { setDefaultTimeout, setWorldConstructor } = require('cucumber');
const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');
const safari = require('selenium-webdriver/safari');

const { SAUCELABS_ACCESS_KEY, SAUCELABS_HOST, SAUCELABS_USER } = process.env;

setDefaultTimeout(60 * 1000);

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

const World = function World(args) {
    const { browser } = args.parameters;

    if (args.parameters.local) {
        this.host = 'http://localhost:3000';
        this.driver = getLocalBrowser(browser, args.parameters.display);
    } else {
        this.host = 'http://app.local:3000';
        this.driver = getBrowser(browser)();
    }
};

setWorldConstructor(World);
