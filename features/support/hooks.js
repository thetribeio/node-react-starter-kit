const { After } = require('cucumber');

After(function () { this.driver.quit(); });
