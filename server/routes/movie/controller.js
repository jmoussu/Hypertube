const Movie = require('./model.js').Movie;
const User = require('../user/model.js');

async function getMovieInfo(req, res) {
	const { imdb } = req.params;
	try {
	let dbRes = await checkDb(imdb);
	if (dbRes)
		return res.send(dbRes);
	else
		return res.sendStatus(404);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		return res.sendStatus(404);
	}
}

async function addMovie(req, res) {
	const { imdb } = req.query;
	let data = req.body;
	delete data.imdb;
	try {
		let dbRes = await checkDb(imdb);
		if (dbRes)
			return res.sendStatus(200);
		else if (dbRes === false)
		{
			let newMovie = new Movie({
				title: data.title,
				imdb: imdb,
				data: data,
				files: {},
			});
			await newMovie.save();
			return res.sendStatus(200);
		}
	}
	catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		return res.sendStatus(503);
	}
}

async function checkDb(imdb) {
	try {
		let dbRes = await Movie.findOne({imdb: imdb}).exec();
		if (!dbRes)
			return false;
		else
			return (dbRes);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		return (null); 
	}
}

module.exports.getMovieInfo = getMovieInfo;
module.exports.addMovie = addMovie;
