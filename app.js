var PrinterBot = require('./printerbot.js');

var config = require('./config.json');

var settings = {
    token: config.slack_key,
    name: '3dprinterbot',
    cloudant_username:config.cloudant_username,
    cloudant_password:config.cloudant_password,
    cloudant_db:config.cloudant_db,
};


var printer_bot = new PrinterBot(settings);

printer_bot.run();
