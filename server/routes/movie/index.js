var express = require('express');
var router = express.Router();
var stream = require('./stream.js');
var model = require('./model.js');
var sub = require('./subtitles.js');
var com = require('./comments.js');
var trans = require('./translate.js');
var ctrl = require('./controller.js');

router.get('/watch/:url', stream.watchUrl);
/**
 * This route returns a stream of the asked movie.
 * !! Don't over spam it when moving cursor on a playing movie
:url [required] => torrent hash or torrent magnet string
query : 
	- title [required] => The movie title 
	- imdb [required] => Movie's imdb
	- quality [required] => ex: 720p, 1080p
	- xt [optionnal] => when magnet string format 
 **/

router.get('/subtitles', sub.searchSub);
/**
 * This route returns an array [{id, pathtofile, lang}] of available subitles
query : 
	- imdb [required] => Movie's imdb
 **/

router.post('/comment/add', com.addComment);
/**
 * This route add a comment to database and return it's id.
body : 
	- imdb [required] => Movie's imdb
	- userId [required] => Database's userId
	- comment [required] => The comment string
 **/

router.post('/comment/delete', com.delComment);
/**
 * This route add a comment to database and return it's id.
body : 
	- imdb [required] => Movie's imdb
	- userId [required] => Database's userId
	- commentId [required] => Database's commentId
 **/

router.get('/comment/display', com.displayComment);
/**
 * This route return an array of comment [id, userId, content, date] 
query :
	- imdb [required] => Movie's imdb
	- title [required] => Movie's title
 **/

router.post('/translate', trans.translate);
/**
 * This route return an object {text: results} 
body :
	- text [required] => Movie's synopsis or any string in english 
 **/

router.post('/add', ctrl.addMovie);
/**
 * This route return 200 status code or 503 il db's server is down.
 * It checks if the movie exist in DB, and if not created it with body info
query :
	- imdb [required] => Movie's imdb
body :
	- all movies information like title, ratings, torrents hash/magnet....
 **/

router.get('/info/:imdb', ctrl.getMovieInfo);
/**
 * This route return an object of Db's results for the imdb param or 404 
params :
	- imdb [required] => Movie's imdb
 **/

module.exports = router;
