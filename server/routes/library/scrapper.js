/*
API SCRAPPERS
##POP CORN https://popcorntime.api-docs.io/api/welcome/introduction
- https://tv-v2.api-fetch.website/movies -> pour avoir la liste des pages, la 1 etant possedant les films les plus anciens (verif tri)
- https://tv-v2.api-fetch.website/movies/20?sort=last%20added&order=-1 -> affiche les films de la page 20 trié par date d'ajout decroissante

##YTS https://yts.lt/api
- https://yts.lt/api/v2/list_movies.json?limit=50&page=2&sort_by=date_added -> affiche les files de la page 2 triés par date d'ajout
Donc pour avoir les films uploadés les plus recent : 
https://yts.lt/api/v2/list_movies.json
*/

const axios = require('axios');
const cloudscraper = require('cloudscraper');

//FORM THE REQUEST WHICH ARE GOING TO BE DONE BASED ON str
//POP CORM AND YTS ARE FETCHED
function selectReq(type = 'popular', page = 1, search = '42') {
	let popReq = 'https://tv-v2.api-fetch.website';
	let ytsReq = 'https://yts.lt/api/v2';

	if (type === 'popular')
	{
		popReq += `/movies/${page}?sort=trending&order=-1`;
		ytsReq += `/list_movies.json?limit=50&page=${page}&quality=720p,1080pi`
			+ `&sort_by=download_count`;
	}
	else if (type === 'lastadded')
	{
		popReq += `/movies/${page}?sort=last%20added&order=-1`;
		ytsReq += `/list_movies.json?limit=50&page=${page}&quality=720p,1080p`;
	}
	else if (type === 'random')
	{
		popReq += '/random/movie';
		ytsReq += `/movie_suggestions.json`
		+ `?movie_id=${Math.floor(Math.random() * Math.floor(10000))}`;
	}
	else if (type === 'search')
	{
		popReq += `/movies/1?sort=last%20added&order=-1&keywords=${search}`;
		ytsReq += `/list_movies.json?query_term=${search}&quality=720p,1080p`;
	}
	return ([popReq, ytsReq]);
}

//PERFORM REQUEST AND RETURN API'S RESULTS ORDER BY POP THEN YTS
async function fetchAPI(type, page, search) {
	let error = [];
	let yts, pop;
	let [popReq, ytsReq] = selectReq(type, page, search);
	try {
		yts = await cloudscraper({
			method: 'GET',
			uri: ytsReq
		});
		yts = JSON.parse(yts);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		error.push('yts');
	}
	try {
		pop = await axios.get(popReq);
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		error.push('pop');
	}
	if (error.length === 2)
		return ([]);
	else if (error.includes('pop'))
		return ([null, yts.data.movies]);
	else if (error.includes('yts'))
	{
		if (type === 'random')
			return ([[pop.data], null]);
		else 
			return ([pop.data, null]);
	}
	else
	{
		if (type === 'random')
			return ([[pop.data], yts.data.movies]);
		else
			return ([pop.data, yts.data.movies]);
	}
}

exports.fetchAPI = fetchAPI;
