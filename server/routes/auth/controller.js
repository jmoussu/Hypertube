var User = require('../user/model.js');
const bcrypt = require('bcrypt');
var utilities = require('./utilities.js');
const uuidv1 = require('uuid/v1');
const formidable = require('formidable');
const fs = require('fs-extra');
var jwt  = require('jsonwebtoken');

async function createUser(strategy, profile) {
	let user;
	if (strategy === 'local')
	{
		let pass = bcrypt.hashSync(profile.password, 10);
		user = User({
			username: profile.username,
			lastname: profile.lastname,
			firstname: profile.firstname,
			mail: profile.mail,
			password: pass,
			avatar: profile.avatar,
			sourceId: { source: "local" },
			tokenForget: profile.tokenForget,
			complete: true,
		});
	}
	else if (strategy === '42') {
		user = new User({
			firstname: profile.name.givenName.toLowerCase(),
			lastname: profile.name.familyName.toLowerCase(),
			mail: profile.emails[0].value,
			sourceId: {
				source : profile.provider,
				id: profile.id
			},
			avatar: profile.photos[0].value
		});
	} else if (strategy === 'github'){
		user = new User({
			sourceId: {
				source : profile.provider,
				id: profile.id
			},
			mail: profile._json.email,
			avatar: profile.photos[0].value
		});
	} else if (strategy === 'instagram') {
		user = new User({
			lastname: profile.name.familyName,
			firstname: profile.name.givenName,
			sourceId: {
				source : profile.provider,
				id: profile.id
			},
			avatar: profile._json.data.profile_picture
		});
	}
	try {
		let result = await user.save();
		return (result)
	} catch (e) {
		if (process.env.MODE === 'DEV')
			console.error(e);
		return ({error: "already exists"});
	}
}

exports.register = async function (req, res) {
	let err = [];
	let img;
	var form = new formidable.IncomingForm();
	form.parse(req, async function (error, fields, files) {
		if (error)
			return res.send({error: 'unknown'});
		for (var prop in fields)
		{
			if (prop === 'cfpassword') {
				err.push({
					field: prop,
					error: await utilities.checkInfo(prop, fields[prop], fields['password'])
				});
			} else {
				err.push({
					field: prop,
					error: await utilities.checkInfo(prop, fields[prop])
				});
			}
		}
		if (files.file)
		{
			img = addAvatar(files.file);
			err.push({
				field: 'img',
				error: img.error
			});
		}
		if (err.length !== 7)
			return res.send({error: 'missing'});
		else {
			err = err.filter(e => e.error);
			if (err.length === 0) {
				let token = uuidv1();
				let result = await createUser("local", {...fields,
					avatar: img.path, tokenForget: token});
				if (result.error)
					res.send({error: result.error});
				else {
					await utilities.sendMail("activate", fields.mail,
						fields.username, token, "eng");
					res.sendStatus(200);
				}
			} else
				res.send({error: err});
		}
	})
}

exports.checkFields = async function(req, res) {
	let error;
	if (req.params.name === 'cfpassword')
	{
		error = await utilities.checkInfo(req.params.name, req.body.password,
			req.body.cfpassword);
	}
	else
		error = await utilities.checkInfo(req.params.name, req.body.value);
	if (error)
		res.send({error: error});
	else
		res.sendStatus(200);
}

exports.checkCookie = async function(req, res) {
	let cookie = req.signedCookies.accessToken;
	if (cookie)
	{
		var decoded = jwt.verify(cookie, process.env.JWT_KEY);
		if (decoded.id)
		{
			let user = await User.findById(decoded.id).exec();
			if (user)
				return res.send({
					id: decoded.id,
					username: user.username || null,
					avatar: user.avatar || null,
					complete: user.complete,
					lang: user.lang,
					views: user.views
				});
		}
	}
	return res.sendStatus(200);
}

function createCookie(req, res, isLocal) {
	let token = jwt.sign({id: req.user._id},
		process.env.JWT_KEY,
		{expiresIn: 7200000}
	);
	res.cookie('accessToken', token, { expires: new Date(Date.now() + 7200000),
		httpOnly: true, signed: true});
	if (isLocal)
		return res.send(req.user);
	else
		return res.redirect('http://localhost:3000');//3001 en prod
}

function addAvatar(file) {
	let error = checkImg(file);
	try {
		if (error)
		{
			fs.unlinkSync(file.path);
			return ({error: error});
		}
		else
		{
			let newname = uuidv1() + file.name;
			let newpath = `./files/avatar/${newname}`;
			fs.copySync(file.path, newpath);
			fs.unlinkSync(file.path);
			return ({path: `/files/avatar/${newname}`, error: error});
		}
	} catch (e) {
		if (process.env.MODE === 'DEV')
			console.error(e);
		error ? error : 'unknow';
		return ({error: error});
	}
}

function checkImg(img)
{
	let error = null;

	if (!img.type.match(/image\/?(png)|(jpg)|(jpeg)/))
		error = 'format';
	else if (img.name.length === 0)
		error = 'empty';
	else if (img.size > 1000000)
		error = 'size';
	return error;
}

exports.forgetPass = async function(req, res) {
	try {
		let user = await User.findOne({ username: req.body.username });
		if (!user)
			return res.sendStatus(404);
		let token = uuidv1();
		if (user.mail) {
			if (!user.tokenForget)
			{
				user.tokenForget = token;
				user.markModified('tokenForget');
				await user.save();
				utilities.sendMail("forget", user.mail, user.username, user.tokenForget, user.lang);
				return res.sendStatus(200);
			} else
				return res.send({info: "already"});
		} else
			return res.sendStatus(404);
	} catch (e) {
		if (process.env.MODE === 'DEV')
			console.error(e);
		return res.sendStatus(404);
	}
}
/* MODIFIER PASSWORD FOR FORGET PASS OR UPDATE IN ACCOUNT*/
exports.editPass = async function (req, res) {
	try {
		let err = [];
		const { token, password, cfpassword } = req.body;
		let user = await User.findOne({tokenForget: token});
		if (!user)
			user = await User.findById(token).exec();
		if(!user)
			return res.sendStatus(404);
		let forget;
		user.tokenForget === '' ? forget = false : forget = true;
		err.push({
			filed: 'password',
			error: await utilities.checkInfo('password', password)
		});
		err.push({
			filed: 'cfpassword',
			error: await utilities.checkInfo('cfpassword', password, cfpassword)
		});
		err = err.filter(e => e.error);
		if (err.length === 0){
			user.password = bcrypt.hashSync(password, 10);
			user.tokenForget = '';
			await user.save();
			if (forget)
				return (res.send({origin: 'forget'}));
			else
				return (res.send({origin: 'user'}))
		}
		else
			return res.send({error : err});
	} catch (e) {
		if (process.env.MODE === 'DEV')
			console.error(e);
		return res.sendStatus(404);
	}
}

/* REGISTRATION LOCAL => ACTIVATION */
exports.activate = async function (req, res) {
	if (req.params.token) {
		try {
			let user = await User.findOne({tokenForget: req.params.token});
			if (user) {
				user.tokenForget = '';
				await user.save();
				return res.send(user.username);
			}
			else
				return res.sendStatus(404);
		} catch (e) {
			if (process.env.MODE === 'DEV')
				console.error(e);
			return res.sendStatus(404);
		}
	}
}
exports.addAvatar = addAvatar;
exports.createUser = createUser;
exports.createCookie = createCookie;
