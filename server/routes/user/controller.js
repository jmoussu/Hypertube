const User = require('./model.js');
const formidable = require('formidable');
const fs = require('fs-extra');
const uuidv1 = require('uuid/v1');
const bcrypt = require('bcrypt');
const utilities = require('../auth/utilities.js');
const addAvatar = require('../auth/controller.js').addAvatar;

async function displayMyInfo(req, res) {
	const { id } = req.params;
	try {
		let user = await User.findById(id).exec();
		if (user){
			let pass;
			user.password ? pass = true : pass = false;
			return res.send({
				username: user.username,
				lastname: user.lastname,
				firstname: user.firstname,
				mail: user.mail,
				views: user.views,
				lang: user.lang,
				avatar: user.avatar,
				password: pass
			});
		}
		else
			return res.sendStatus(404);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		return res.sendStatus(404);
	}
}
async function displayOtherInfo(req, res) {
	const { username } = req.params;
	try {
		let user = await User.findOne({ username: username}).exec();
		if (user)
			return res.send({
				username: user.username,
				lastname: user.lastname,
				firstname: user.firstname,
				avatar: user.avatar,
				views: user.views,
				lang: user.lang
			});
		else
			return res.sendStatus(404);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		return res.sendStatus(404);
	}
}

async function changeMyInfo(req, res) {
	const { id, type } = req.params;
	let user = await User.findById(id).exec();
	if (!user)
		return res.sendStatus(404);
	if (type === 'img')
		return changeAvatar(user, req, res);
	else if (type === 'user')
		return changeData(user, req, res);
	else if (type === 'mdp')
		return changePassword(user, req, res);
	else
		return res.sendStatus(404);
}

async function editLang(req, res) {
	let { id, lang } = req.params;
	let user = await User.findById(id).exec();
	if (!user)
		return res.sendStatus(404);
	else
	{
		if (user.lang !== lang)
		{
			user.lang === 'eng' ? user.lang = 'fr' : user.lang = 'eng';
			user.save();
		}
		return (res.sendStatus(200));
	}
}

async function checkComplete(user) {
	if (!user.complete && user.username && user.lastname
		&& user.avatar && user.mail)
	{
		user.complete = true;
		await user.save();
	}
}

async function changeAvatar(user, req, res) {
	var form = new formidable.IncomingForm();
	let file = await new Promise(function(resolve, reject) {
		form.parse(req, function(err, fields, files) {
			if (err) {
				reject(err);
				return;
			}
			resolve(files.file);
		})
	});
	let img = addAvatar(file);
	if (!img.error)
	{
		user.avatar = img.path;
		await user.save();
		if (!user.complete)
			await checkComplete(user);
		return res.send(user);
	}
	else
		return res.send({error: img.error});
}
async function changeData(user, req, res) {
	let err = [];
	const { username, lastname, firstname, mail } = req.body;
	const obj = { username: username, lastname: lastname,
		firstname: firstname, mail: mail };
	for (var prop in obj)
	{
		if (obj[prop] && obj[prop] !== user[prop])
		{
			err.push({
				field: prop,
				error: await utilities.checkInfo(prop, obj[prop])
			});
			user[prop] = obj[prop]
		}
	}
	err = err.filter(e => e.error);
	if (err.length === 0)
	{
		await user.save();
		if (!user.complete)
			await checkComplete(user);
		return res.send(user);
	}
	else
		return res.send({error : err});
}
async function changePassword(user, req, res) {
	let err = [];
	const { password, cfpassword } = req.body;
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
		let pass = bcrypt.hashSync(profile.password, 10);
		user.password = pass;
		await user.save();
		if (!user.complete)
			await checkComplete(user);
		return res.send(user);
	}
	else
		return res.send({error : err})
}
async function addView(req, res) {
	const { id, title, imdb } = req.body;
	try {
		let user = await User.findById(id);
		if (user)
		{
			if (!user.views.includes(title))
			{
			user.views.push({title: title, imdb: imdb})
			await user.save();
			}
			return res.sendStatus(200);
		}
		else
			return res.sendStatus(404);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		return res.sendStatus(404);
	}
}
async function delView(req, res) {
	const { id } = req.body;
	try {
		let user = await User.findById(id);
		if (user)
		{
			user.views = []
			await user.save();
			return res.sendStatus(200);
		}
		else
			return res.sendStatus(404);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		return res.sendStatus(404);
	}
}

module.exports.displayMyInfo = displayMyInfo;
module.exports.changeMyInfo = changeMyInfo;
module.exports.displayOtherInfo = displayOtherInfo;
module.exports.editLang = editLang;
module.exports.addView = addView;
module.exports.delView = delView;
