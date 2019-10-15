//ESSENTIAL COMPOSANT
const http = require('http');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const passport = require('passport');
var cookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const path = require('path');
var jwt  = require('jsonwebtoken');
var User = require('./routes/user/model.js');
require('dotenv').config()

//PORT
const port = 3001;

//CONFIG VARIABLES
const app = express();
const server = require('http').Server(app);
const dbServer = 'localhost';
const database = 'hypertube';

//DATABASE ET CONNEXION
mongoose.connect(`mongodb://${dbServer}/${database}`, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log('Db connection succeed');
})

//CRONJOB
require('./cronjob.js');

//ROUTERS
const userRouter = require('./routes/user');
const libraryRouter = require('./routes/library');
const movieRouter = require('./routes/movie');
const authRouter = require('./routes/auth');

//MIDDLEWARES
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});
app.use(helmet());
app.use(cookieParser(process.env.COOKIE_KEY))
app.use('/files', express.static(__dirname + '/files'));
//app.use(express.static(__dirname + '/build'));//PROD
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize());
//MIDDLEWARE CRSF
app.use(async function (req, res, next) {
	let reg = /^\/(user|library|movie)/;
	let cookie = req.signedCookies.accessToken;
	let decoded;
	if (reg.test(req.path))
	{
				if (cookie)
				{
					decoded = jwt.verify(cookie, process.env.JWT_KEY);
					if (decoded.id && await User.findById(decoded.id).exec())
						next();
					else
						return res.sendStatus(401);
				}
				else
					return res.sendStatus(401);
	}
	else
		next();
});


//ROUTERS API
app.use('/user', userRouter);
app.use('/library', libraryRouter);
app.use('/movie', movieRouter);
app.use('/auth', authRouter);


/*
//ROUTE WITH BUILD -> PROD
app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/profil', function (req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/film', function (req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/activer', function (req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/motdepasse', function (req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/membres', function (req, res) {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
*/

app.use(function(req, res, next) {
	//res.sendFile(path.join(__dirname, 'build', 'index.html'));//PROD
	res.status(404).send('Sorry cant find that!');
});
app.listen(port, function () {
	console.log('\x1b[1m', `Server ready on port ${port}`, '\x1b[0m');
});
