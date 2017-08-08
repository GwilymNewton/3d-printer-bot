var Cloudant = require('cloudant');



class CloudantQueue {


constructor(settings)
  {
    // Initialize Cloudant with settings from .env
this.username = settings.username
this.password = settings.password
this.cloudant = Cloudant({account:this.username, password:this.password});
  }


push()
  {

  }

pop()
  {

  }

list()
  {

  }

length()

  {

  }


}
