const mongoose = require('mongoose');

//IMDB = id du torrent, in files 'type' = quality of the movie
var movieSchema = new mongoose.Schema({
	title: { type: String, require: true, unique: true },
	imdb: { type: String, require: true, unique: true },
	files: {
		type: {
			path: String,
			folder: String,
			extension: String,
			complete: Boolean,
			lastview: Date,
			size: Number
		}
	},
	data: {},
	comments : [
		{
			userId: String,
			content: String,
			date : Date
		} 
	],
});
var Movie = mongoose.model('Movie', movieSchema);

var subSchema = new mongoose.Schema({
	movie_imdb: { type: String, require: true, unique: true },
	files: [
		{
			path: String,
			lang: String,
		}
	]
});
var Sub = mongoose.model('Subtitle', subSchema);

exports.Movie = Movie;
exports.Sub = Sub;
