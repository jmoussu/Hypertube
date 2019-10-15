var OAuthStrategy = require('passport-oauth2').OAuthStrategy;
var LocalSgy = require('passport-local').Strategy;
var FortyTwoSgy = require('passport-42').Strategy;
var GitHubSgy = require('passport-github').Strategy;
var InstagramSgy = require('passport-instagram').Strategy;
const bcrypt = require('bcrypt');
var User = require('../user/model.js');
var ctrl = require('./controller.js');

const localStrategy = new LocalSgy(
	function(username, password, done) {
		User.findOne({ username: username }, function (err, user) {
			if (err) { return done(err); }
			if (!user)
				return done("!user", false);
			if(!user.password || !bcrypt.compareSync(password, user.password))
				return done("!pass", false);
			if (user.tokenForget !== '')
				return done("token", false);
			return done(null, user);
		});
	}
);

const fortytwoStrategy = new FortyTwoSgy({
	clientID: process.env.FORTYTWO_APP_ID,
	clientSecret: process.env.FORTYTWO_APP_SECRET,
	callbackURL: "http://localhost:3001/auth/42/return",
	profileFields: {
		'id': function (obj) { return String(obj.id); },
		'username': 'login',
		'name.familyName': 'last_name',
		'name.givenName': 'first_name',
		'emails.0.value': 'email',
		'photos.0.value': 'image_url'
	}
}, async function(accessToken, refreshToken, profile, done) {
	let user = await User.findOne({"sourceId.id" : profile.id, "sourceId.source" : profile.provider});
	let error = null;
	if (!user) {
		try {
			user = await ctrl.createUser('42', profile, done);
			return done(error,user);
		} catch (e) {
			if (process.env.MODE === 'DEV')
				console.error(e);
			error = e;
		}
	}
	return done(error,user);
}
);

const gitHubStrategy = new GitHubSgy({
	clientID: process.env.GITHUB_APP_ID,
	clientSecret: process.env.GITHUB_APP_KEY,
	callbackURL: "http://localhost:3001/auth/github/return"
},
	async function(accessToken, refreshToken, profile, done) {
		let user = await User.findOne({"sourceId.id" : profile.id, "sourceId.source" : profile.provider});
		let error = null;
		if (!user) {
			try {
				user = await ctrl.createUser('github', profile, done);
				return done(error,user);
			} catch (e) {
				if (process.env.MODE === 'DEV')
					console.error(e);
				error = e;
			}
		}
		return done(error,user);
	}
)

const instaStrategy = new InstagramSgy({
	clientID: process.env.INSTA_APP_ID,
	clientSecret: process.env.INSTA_APP_KEY,
	callbackURL: "http://localhost:3001/auth/instagram/return"
},
	async function(accessToken, refreshToken, profile, done) {
		let user = await User.findOne({"sourceId.id" : profile.id, "sourceId.source" : profile.provider});
		let error = null;
		if (!user) {
			try {
				user =  await ctrl.createUser('instagram', profile, done);
				return done(error,user);
			} catch (e) {
				if (process.env.MODE === 'DEV')
					console.error(e);
				error = e;
			}
		}
		return done(error,user);
	}
);

module.exports = {
	localStrategy: localStrategy,
	fortytwoStrategy: fortytwoStrategy,
	gitHubStrategy: gitHubStrategy,
	instaStrategy: instaStrategy
}
