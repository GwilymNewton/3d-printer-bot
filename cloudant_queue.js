var Cloudant = require('cloudant');

class CloudantQueue {


  constructor(settings) {
    // Initialize Cloudant with settings from .env
    this.username = settings.username;
    this.password = settings.password;
    this.db = settings.db;
    this.cloudant = Cloudant({
      account: this.username,
      password: this.password
    });

    this.cloudant.db.list(function (err, allDbs) {
      console.log('All my databases: %s', allDbs.join(', '))
    });

    this.queue = this.cloudant.db.use(this.db);

  }


  push(item, callback) {

    this.queue.insert(item, "" + Date.now(), function (err, body, header) {
      if (err) {
        return console.log('[queue.insert] ', err.message);
        callback(false);
      }
      callback(true);
    });


  }

  pop(callback) {

    //We need to find the top of the queue, then have that call back to delete
    //I DONT LIKE CALLBACKS ARCHITECTURE
    this.getlastestDoc(this.deleteDoc,callback)

  }

  list(callback) {

    this.queue.find({
      "selector": {
        "_id": {
          "$gt": 0
        }
      },
      "fields": ["_id", "_rev","user","file"],
      "sort": [
        {
          "_id": "asc"
        }
  ],
      "limit": 11,
    }, function (err, results) {

      console.log(results)
      if (err) {
        callback(null);
      } else if (results.length === 0) {
        callback(null);
      } else {
        callback(results.docs);
      }



    });

  }

  length()

  {

  }


  //UNTIL FUNCTIONS
  //EUGH
  getlastestDoc(callback,callback_two) {

    var queue = this.queue

    this.queue.find({
      "selector": {
        "_id": {
          "$gt": 0
        }
      },
      "fields": ["_id", "_rev","user","file"],
      "sort": [
        {
          "_id": "asc"
        }
  ]
    }, function (err, result) {

      if (err) {
        callback(null,queue,callback_two);
      } else if (result.length === 0) {
        callback(null,queue,callback_two);
      } else {
        callback(result.docs[0],queue,callback_two);
      }



    });


  }


  deleteDoc(top,queue,callback)
{
      //then pop it off

  console.log(top)

    queue.destroy(top._id, top._rev, function (err, body) {
      if (!err)
        console.log(top);
      callback(top);
    });
}

}

module.exports = CloudantQueue;
