const express = require("express");
const path = require("path");
const fs =require("fs");
const users = require('./routes/user-routes');
const session = require("express-session");
const flash = require("connect-flash");
const key = require('./config/keys');
const morgan = require("morgan");
const bodyParser = require("body-parser");
const ejs = require("ejs");
//api for sending sms
const socketio = require("socket.io");
const Nexmo = require("nexmo");
//init nexmo
const nexmo = new Nexmo({

apiKey: 'your-nexmo-api-key-should-be-here ',
apiSecret :'secret-goes-here '

},{debug: true});//debug is set to true

//init app
const app = express();


//middlewares setup
//template engine 
app.set('view engine','ejs');
// Public folder setup
app.use(express.static(__dirname + '/public'));
//public folder setup

app.use(express.static(__dirname+'/images'));

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//create a write stream in append mode
var accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'})
//set up the logger
app.use(morgan('combined',{stream:accessLogStream}))


app.use(session({
  cookie: {
    Name:'session',
    maxAge:10 * 60 * 1000,
    ephemeral:true
},
  secret: '[key.session.cookie]',
  resave:false,
  saveUninitialized:true

  
}))
app.use(flash());

 //database connection setup
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://your-username:your-password@ds129098.mlab.com:29098/smsapp",{ useNewUrlParser: true ,useUnifiedTopology:true})
.then(() => console.log('connection successful'))
.catch((err) => console.log(err));

// database connection end




//setting up the routes directory
app.use('/',users);

const server=app.listen('8080',function(req,res){


	console.log("Welcome,You are listening to port 8080!!")
});
//connect to socket.io
const io = socketio(server);
io.on('connection',function(socket){
	console.log('connected');
	socket.on('disconnect',function(){
		console.log('user disconnected');
	});
});
