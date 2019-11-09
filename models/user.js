var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
var userschema = new mongoose.Schema({

     name: {
      type:String,
      trim:true,
      required:true
      

    },
    username: String,
    password: {
    
    type:String,
    validate:[
    
    function(password){

      password.length >= 6;
    },
    'password should be longer'

    ]
  },

    email:{
      type:String,
      index:true,
      match:/.+\@.+\..+/,
      required:'Email address is required',
      trim:true
    }





});

var User = mongoose.model("User",userschema);
//to export the functionality
module.exports=User;