var express = require('express');
var router = express.Router();
var ctrl = require('./controller.js');

/**
 * ALL THEESE ROUTE RETURNS A TAB OF OBJECTS OF SCRAPPED MOVIE
**/

router.get('/', ctrl.getPopular);
router.get('/lastadded', ctrl.getLastAdded);
/**
 * For theese two :
query : 
	- page [optionnal] => if not === 1, to scrap results pages
 **/

router.get('/random', ctrl.getRandom);

router.get('/search', ctrl.getSearch);
/**
 *
query :
	- name [required] => name of the movie, else => 42
 **/


module.exports = router;
