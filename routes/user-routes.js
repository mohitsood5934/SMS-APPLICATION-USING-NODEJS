const express= require("express");
const bcrypt = require("bcrypt-nodejs");

const User = require("../models/user");
const router = require("express").Router();
const io = require("socket.io");
const Nexmo = require("nexmo");
const nexmo = new Nexmo({
apiKey: 'your-API-key ',
apiSecret :'your-secret '

},{debug: true});

router.get('/',function(req,res){
res.render('home',{user:req.user});

});
router.get('/home',function(req,res){

res.render('home',{user:req.user});
});
router.get('/login',function(req,res){

    res.render('login',{user:req.user});
});
router.get('/logout',function(req,res){
console.log("You are logged out");
req.session.destroy();
res.redirect('/login');

});
router.get('/signup',function(req,res){

res.render('signup',{user:req.user});


});

router.get('/index',function(req,res){
  if(req.session && req.session.user){
    User.findOne({Username:req.session.user.Username}).exec(function(err,user)
    {

      if(!user)
      {
        req.session.reset();
        res.redirect('/login');
      }
      else
      {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
        res.render('index');
      }
    });
  }
  else{
  res.redirect('/login');
}
});
;
 
router.post("/signup", function(req, res){
    
    var name = req.body.name;
    var username= req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    
  
  //use schema.create to insert data into the db
 User.create({

    name: name,
    username: username,
    password : bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
    email: email




 },function(err, user) {
    if (err) {
      console.log(err);
      res.status(400).json(err);
    } else {
      console.log('user created', user);
      res.redirect('/login');

    }
  });
});
router.post('/login', function(req, res) {
  console.log('logging in user');
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({
    username: username
  }).exec(function(err, user) {
    if (err) {
      console.log(err);
      res.status(400).json(err);
    } else {
      if (bcrypt.compareSync(password, user.password)) {
        req.session.user = user;//set a cookie with user's info
        res.redirect('/index');
        console.log('User found', user);
      } else {
        res.status(401).json('Unauthorized');
      }
    }
  });
});




router.post('/index',function(req,res){

//res.send(req.body);
//console.log(req.body);
const number = req.body.number;
const text = req.body.text;
 nexmo.message.sendSms(
    '82191*****', number, text, { type: 'unicode' },
    (err, responseData) => {
      if(err) {
        console.log(err);
      } else {
        console.dir(responseData);


        const data = {
            id: responseData.messages[0]['message-id'],

            number: responseData.messages[0]['to']
        }
        //emit to client
        io.emit('smsStatus',data);

}
});
});
module.exports=router;
