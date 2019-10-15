const Movie = require('./model.js').Movie;
const User = require('../user/model.js');


async function addComment(req, res) {
	const { imdb, id, comment } = req.body;
	if (comment.trim() === '')
		return (res.sendStatus(418));
	try {
		let dbRes = await Movie.findOne({imdb: imdb}).exec(); 
		if (!dbRes)
			return (res.sendStatus(404));
		if (!/<.*>/.test(comment))
		{
			dbRes.comments.unshift({
				userId : id,
				content: comment,
				date: Date.now()
			});
			await dbRes.save();
			return res.send(dbRes.comments[0]);
		}
		else
			return res.send({error : 'format'});
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		return (res.sendStatus(418));
	}
}

async function delComment(req, res) {
	const { imdb, id, commentId } = req.body;
	try {
		let dbRes = await Movie.findOne({imdb: imdb}).exec(); 
		let comment = dbRes.comments.id(commentId);
		if (dbRes && comment && comment.userId === id)
		{
			dbRes.comments.pull(commentId);
			await dbRes.save();
			return (res.sendStatus(200));
		}
		else
			return res.status(400).send('format');
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		return res.sendStatus(418);
	}
}

async function displayComment(req, res) {
	let dbRes = await checkDb(req);
	if (!dbRes)
		return res.sendStatus(418);
	if (dbRes.comments)
	{
		let ids = dbRes.comments.map(e => e.userId);
		let users = await User.find().where('_id').in(ids).exec();
		let tmp = dbRes.comments.map(e => {
			let find = users.find(f => f._id.toString() === e.userId);
			return ({
				_id: e._id,
				userId: e.userId,
				username: find.username,
				content: e.content,
				date: e.date
			});
		})
		return res.send(tmp);
	}
	else
		return res.send([]);
}

async function checkDb(req) {
	const { imdb, title } = req.query;
	try {
		let dbRes = await Movie.findOne({imdb: imdb}).exec();
		if (!dbRes)
		{
			dbRes = new Movie({
				title: title,
				imdb: imdb,
				data: {},
				files: {},
			});
			await dbRes.save();
		}
		return (dbRes);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		return null; 
	}
}

module.exports.addComment = addComment;
module.exports.delComment = delComment;
module.exports.displayComment = displayComment;
