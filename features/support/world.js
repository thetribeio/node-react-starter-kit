/* eslint-disable func-names */
const { setDefaultTimeout, setWorldConstructor } = require('cucumber');
const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const chrome = require('selenium-webdriver/chrome');
const safari = require('selenium-webdriver/safari');

const { SAUCELABS_ACCESS_KEY, SAUCELABS_HOST, SAUCELABS_USER } = process.env;

setDefaultTimeout(60 * 1000);

const getBrowser = (browser) => () => new Builder()
    .withCapabilities({
        username: SAUCELABS_USER,
        accessKey: SAUCELABS_ACCESS_KEY,
        host: SAUCELABS_HOST,
        port: 4445,
        implicit: 5000,
    })
    .usingServer(`http://${SAUCELABS_USER}:${SAUCELABS_ACCESS_KEY}@${SAUCELABS_HOST}:4445/wd/hub`)
    .forBrowser(browser)
    .build();

const getLocalBrowser = (browser, display) => {
    let ffoptions = null;

    switch (browser) {
        case 'chrome':
            ffoptions = new chrome.Options();
            break;
        case 'safari':
            ffoptions = new safari.Options();
            break;
        default:
            ffoptions = new firefox.Options();
            break;
    }

    if (!display) {
        ffoptions.headless();
    }

    return new Builder()
        .setFirefoxOptions(ffoptions)
        .setChromeOptions(ffoptions)
        .setSafariOptions(ffoptions)
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
