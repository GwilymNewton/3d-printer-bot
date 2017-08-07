var PrinterBot = require('./printerbot.js');

var config = require('./config.json');

var settings = {
    token: config.slack_key,
    name: '3dprinterbot'
};

var printer_bot = new PrinterBot(settings);

printer_bot.run();
