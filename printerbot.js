var Bot = require('slackbots');
var util = require('util');

class PrinterBot extends Bot {

  constructor(settings) {
    super(settings)
    this.settings = settings;
    this.settings.name = this.settings.name || '3dprinterbot';

    this.getUser(this.settings.name).then(function (user) {
      this.user = user

    })
  }

  run() {

    this.on('start', this.onStart);
    this.on('message', this.onMessage);
  }



  onStart() {

    this.loadBotUser();
    //this._connectDb();
    //this._firstRunCheck();
  }

  loadBotUser() {
    var self = this;
    this.user = this.users.filter(function (user) {
      return user.name === self.name;
    })[0];
  }

  welcomeMessage() {
    this.postMessageToChannel('3d-printer-bot', 'Bot has started up', {
      as_user: true
    });
  }



  isChatMessage(message) {
    return message.hasOwnProperty('content');
  }

  isChannelConversation(message) {
    return typeof message.channel === 'string' &&
      message.channel[0] === 'C';
  }

  isFromBot(message) {
    return message.hasOwnProperty('bot_id')
  }

  isMentioning_PrinterBot(message) {
    return (message.hasOwnProperty('content'))&&(message.content.toLowerCase().indexOf(this.settings.name) > -1)
  }


    onMessage(message) {

    console.log("incoming message",message);
    console.log("chat",this.isChatMessage(message));
    console.log("channel",this.isChannelConversation(message));
    console.log("from me",this.isFromBot(message));
    console.log("mentions me",this.isMentioning_PrinterBot(message));

    if (this.isChatMessage(message) &&
      this.isChannelConversation(message) &&
      !this.isFromBot(message) &&
      this.isMentioning_PrinterBot(message)
    ) {
      this.processCommand(message);
    }
  }


  processCommand(originalMessage) {

    var channel = this.getChannelById(originalMessage.channel);

    console.log("replying to ",originalMessage)

    this.postMessageToChannel(channel.name, "test reply", {
      as_user: true
    });

  }


  getChannelById(channelId) {
    return this.channels.filter(function (item) {
      return item.id === channelId;
    })[0];
  };

}

module.exports = PrinterBot;
