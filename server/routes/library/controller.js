const scrapper = require('./scrapper.js');
const axios = require('axios');

async function getLastAdded(req, res) {
	let page = req.query.page || 1;
	try {
		let scrap = await scrapper.fetchAPI('lastadded', page);
		scrap = filterScrap(scrap);
		scrap = await mapScrap(scrap);
		res.send(scrap);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		res.sendStatus(204);
	}
}
async function getPopular(req, res) {
	let page = req.query.page || 1;
	try {
		let scrap = await scrapper.fetchAPI('popular', page);
		scrap = filterScrap(scrap);
		scrap = await mapScrap(scrap);
		res.send(scrap);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		res.sendStatus(204);
	}
}
async function getRandom(req, res) {
	try {
		let scrap = await scrapper.fetchAPI('random');
		scrap = filterScrap(scrap);
		scrap = await mapScrap(scrap);
		res.send(scrap);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		res.sendStatus(204);
	}
}
async function getSearch(req, res) {
	let str = req.query.name || '42';
	try {
		let scrap = await scrapper.fetchAPI('search', 1, str);
		scrap = filterScrap(scrap);
		scrap = await mapScrap(scrap);
		scrap = scrap.sort(sortByName);
		res.send(scrap);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		res.sendStatus(204);
	}
}

//ASSUMING data[0] provided by popcorn and data[1] provided by YTS
//FILTER DOUBLONS BASED ON IMDB
function filterScrap(data) {
	if (data[0] && data[1])
	{
		let imdb = data[1].map(e => e.imdb_code);
		data[0] = data[0].filter(e => !imdb.includes(e.imdb_id));
		return(data[1].concat(data[0]));
	}
	else if (data[0])
		return (data[0]);
	else if (data[1])
		return (data[1]);
	else
		return ([]);
}

//Return an array of object with
//imdb-title-year-synopsis-released-image-genre[]-ratings[]-torrents[]
//actors[]-director-boxoffice
//fetching additionnal informations from omdb api with KEY = PlzbanM3
async function mapScrap(data) {
	data = data.map(e => ({
		imdb: e.imdb_id || e.imdb_code, 
		title: e.title,
		year: e.year,
		synopsis: e.synopsis,
		released: e.released || e.date_uploaded_unix,
		image: e.images ? e.images.poster : e.large_cover_image
		|| e.medium_cover_image || e.small_cover_image,
		genre: e.genres.map(f => {
			let tmp = f.toLowerCase();
			tmp === 'science-fiction' ? tmp = 'sci-fi' : tmp
			return tmp;
		}),
		ratings: parseRate(e.rating),
		torrents: mapTorrent(e.torrents, e.language),
	}));
	let promises = data.map(async e => {
		let res = await axios.get(`http://www.omdbapi.com/?i=${e.imdb}&apikey=${process.env.IMDB_KEY}`)
		e.director = res.data.Director || '';
		e.actors = res.data.Actors || '';
		e.boxoffice = res.data.BoxOffice || '';
		e.ratings = res.data.Ratings || [];
		return e
	});
	let results = await Promise.all(promises.map(p => p.catch(e => e)));
	results = results.filter(e => !(e instanceof Error));
	let imdbs = results.map(e => e.imdb);
	data = data.filter(e => !imdbs.includes(e.imdb));
	return data.concat(results)
}

function parseRate(rate) {
	if (typeof(rate) === 'number')
		return [{Source: 'Internet Movie Database', Value: `${rate}/10`}];
	else if (typeof(rate) === 'object')
		return [{Source: 'Metacritic', Value: `${rate.percentage || 0}/100`}]
	else
		return [];

}
//Return an array with respectively
//quality-lang-seeds-peers-size-hash||magnet
function mapTorrent(torrents, lang) {
	let tmp = [];
	if (Array.isArray(torrents))
	{
		torrents.forEach(e => { 
			if (e.quality !== '3D')
				tmp.push({
					quality: e.quality,
					lang: lang,
					seeds: e.seeds,
					peers: e.peers,
					size: e.size,
					hash: e.hash
				});
		});
	}
	else
	{
		let qualities, data;
		lang = Object.keys(torrents);
		lang.forEach(e => {
			let qualities = Object.keys(torrents[e]).filter(h => (h !== '3D'));
			qualities.forEach(f => {
				data = torrents[e][f];
				tmp.push({
					quality: f,
					lang: e,
					seeds: data.seed,
					peers: data.peer,
					size: data.filesize,
					magnet: data.url
				});
			});
		});
	}
	return (tmp);
}

function sortByName(a, b) {
	let i = 0;
	while (a.title.length < i && b.title.length < i &&
		a.title.charCodeAt(i) === b.title.charCodeAt(i))
		i++;
	if (a.title.charCodeAt(i) > b.title.charCodeAt(i))
		return 1;
	else
		return -1;
}

exports.getLastAdded = getLastAdded;
exports.getPopular = getPopular;
exports.getRandom = getRandom;
exports.getSearch = getSearch;
