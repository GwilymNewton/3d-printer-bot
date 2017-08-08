var Bot = require('slackbots');
var CloudantQueue = require('./cloudant_queue.js');
var util = require('util');

class PrinterBot extends Bot {

  constructor(settings) {
    super(settings)
    this.settings = settings;
    this.settings.name = this.settings.name || '3dprinterbot';

    this.cloud_queue = new CloudantQueue({
      username: settings.cloudant_username,
      password: settings.cloudant_password,
      db: settings.cloudant_db
    });

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
    return (message.hasOwnProperty('content')) && (message.content.toLowerCase().indexOf(this.settings.name) > -1)
  }


  onMessage(message) {

    //console.log("incoming message",message);
    //console.log("chat",this.isChatMessage(message));
    //console.log("channel",this.isChannelConversation(message));
    //console.log("from me",this.isFromBot(message));
    //console.log("mentions me",this.isMentioning_PrinterBot(message));

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

    console.log("replying to ", originalMessage)

    var output = this.parse(originalMessage.content)

    switch (output.command) {
    case "add":
      console.log("adding file")
      this.addToQueue(channel.name, output)
      break;
    case "print":
      console.log("removing file")
      this.printFromQueue(channel.name, output)
      break;
    case "list":
      console.log("listing files")
      this.listQueue(channel.name, output)
      break;
    default:
      console.log("Command Not found")
      this.helpMessage(channel.name, output)
      break;
    }

  }


  getChannelById(channelId) {
    return this.channels.filter(function (item) {
      return item.id === channelId;
    })[0];
  };


  findCommand(str) {
    if (str.includes("list")) {
      return "list"
    } else if (str.includes("print")) {
      return "print"
    } else if (str.includes("add")) {
      return "add"
    } else {
      return null
    }
  }

  findFileName(str) {
    var gcode_regex = /[^\\]*\.(\w+)$/;
    var words = str.split(" ")

    var files = []

    words.forEach(function (word) {

      //console.log(word.match(gcode_regex))
      if (word.match(gcode_regex)) {
        files.push(word)
      }

    })

    return files;

  }


  parse(str) {
    //example
    //content: 'gwilymnewton: @3dprinterbot add dragon.gcode',

    //break out user.
    var index = str.indexOf(":") + 1
    var message = str.substring(index);
    var username = str.substring(0, index - 1);

    console.log("input", str);


    //get rid of @ if present
    str = str.replace("@", "");

    if (message.includes("3dprinterbot")) {
      index = str.indexOf("3dprinterbot") + 12
      message = str.substring(index);
    }

    console.log("message", message)

    var commmand = this.findCommand(message)
    console.log("commmand", commmand)

    var files = this.findFileName(message)
    console.log("file", files)

    return {
      user: username,
      command: commmand,
      files: files
    }




  }

  addToQueue(channelname, output) {

    var self = this;

    //TODO asset we have this data!
    this.cloud_queue.push({
      user: output.user,
      file: output.files[0]
    }, function (pushed) {

      self.postMessageToChannel(channelname, "Thanks @" + output.user + " I added the file:```" + output.files[0] + "``` the print queue", {
        as_user: true
      });


    })



  }

  printFromQueue(channelname, output) {

    var self = this;

    //TODO asset we have this data!
    this.cloud_queue.pop(function (popped) {

      console.log(popped)

      self.postMessageToChannel(channelname, "Thanks @" + output.user + " The file:```" + popped.file + "```Belonging to @" + popped.user + " was removed from the queue and sent to the printer", {
        as_user: true
      });


    })



  }

  listQueue(channelname, output) {

    var self = this;

    //TODO asset we have this data!
    this.cloud_queue.list(function (list) {

      console.log(list)

      var output_list = "```\n"

      for (var i = 0; i <= Math.min(list.length, 9); i++) {
        output_list += list[0].user + " : " + list[0].file + "\n"
      }
      output_list += "```"


      self.postMessageToChannel(channelname, output_list, {
        as_user: true
      });


    })
  }


  helpMessage() {


  }



}



module.exports = PrinterBot;
