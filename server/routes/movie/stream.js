const fs = require('fs');
const torrentStream = require('torrent-stream');
var ffmpeg = require('fluent-ffmpeg');
const pump = require('pump');
var Movie = require('./model.js').Movie;
const trackers = [
	'udp://p4p.arenabg.com:1337',
	'udp://exodus.desync.com:6969',
	'udp://tracker.coppersurfer.tk:6969',
	'udp://glotorrents.pw:6969/announce',
	'udp://tracker.openbittorrent.com:80',
	'udp://open.demonii.com:1337/announce',
	'udp://torrent.gresille.org:80/announce',
	'udp://tracker.internetwarriors.net:1337',
	'udp://tracker.leechers-paradise.org:6969',
	'udp://tracker.opentrackr.org:1337/announce'
];

async function checkDb(imdb, quality) {
	let newMovie;
	try {
		let dbRes = await Movie.findOne({imdb: imdb}).exec(); 
		if (dbRes)
		{
			newMovie = dbRes;
			if (dbRes.files && dbRes.files[quality]
				&& dbRes.files[quality].complete)
			{
				dbRes.files[quality].lastview = Date.now();
				dbRes.markModified('files');
				await dbRes.save();
				return ([true, dbRes.files[quality]]);
			}
			newMovie.files ? newMovie.files : newMovie.files = {};
		}
		else
			newMovie = new Movie({ 
				imdb: imdb,
				files: {},
				data: {},
			});
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		newMovie = new Movie({ 
			imdb: imdb,
			files: {},
			data: {}
		});
	}
	return ([false, newMovie]);
}

async function watchUrl(req, res) {
	const { imdb, quality, xt} = req.query;
	var newMovie = await checkDb(imdb, quality);
	if (newMovie[0])
		return fileToStream(req, res, newMovie[1]);
	else
		newMovie = newMovie[1];
	var magnet;
	var fileDl = 0;
	var isDl = false;
	if (xt)
		magnet = `magnet:?xt=${xt}${req.query.tr.map(e =>
			(`&tr=${e}`)).join('')}`;
	else
		magnet = `magnet:?xt=urn:btih:${req.params.url}${trackers.map(e =>
			(`&tr=${e}`)).join('')}`;
	var engine = torrentStream(magnet, {path: './files/torrents/'});
	engine.on('ready', function() {
		console.log('\x1b[33m', 'Downloading...', '\x1b[0m');
		var videoType;
		engine.files.forEach(function(file) {
			videoType = file.name.match(/mp4|avi|ogg|mkv|webm$/);
			file.select();
			if (videoType)
			{
				if (!newMovie.files[quality])
				{
					newMovie.files[quality] = {
						path: `./files/torrents/${engine.torrent.name}/${file.name}`,
						folder: `./files/torrents/${engine.torrent.name}`,
						extension: videoType[0],
						complete: false,
						size: file.length
					};
					newMovie.markModified('files')
					newMovie.save((err) => {
					});
				}
				if (videoType[0] === 'mp4' || videoType[0] === 'ogg'
					|| videoType[0] === 'webm')
					streamDirectly(req, res, file, videoType[0]);
				else
					convertAndStream(req, res, file);
			}
		});
	});
	engine.on('download', (piece) => {
		isDl = true;
	});
	engine.on('idle', async (data) => {
		fileDl += 1;
		if ((isDl && fileDl >= engine.files.length)
			|| (fileDl >= engine.files.length
				&& !newMovie.files[quality].complete))
		{
			console.log('\x1b[33m', 'Torrent downloaded !', '\x1b[0m');
			newMovie.files[quality].complete = true;
			newMovie.markModified('files')
			await newMovie.save();
		}
	});
	res.on('close', () => {
		engine.destroy();
		fileDl = 0;
		isDl = false;
	});
}

function streamDirectly(req, res, file, type) {
	const range = req.headers.range;
	const pos = range ? range.replace(/bytes=/, '').split('-')
		: null;
	const start = pos ? parseInt(pos[0], 10) : 0;
	const end = (pos && pos[1]) ? parseInt(pos[1], 10)
		: file.length - 1;
	const stream = file.createReadStream({ start: start, end: end });
	res.writeHead(206, {
		'Accept-Ranges': 'bytes',
		'Content-Range': `bytes ${start}-${end}/${file.length}`,
		'Content-Length': (end - start) + 1,
		'Content-Type': `video/${type}`
	});
	stream.pipe(res);
}

function convertAndStream(req, res, file, src) {
	var stream;
	if (src === 'file')
		stream = fs.createReadStream(file);
	else
		stream = file.createReadStream();
	var command = ffmpeg(stream)
		.videoCodec('libvpx')
		.videoBitrate(1024)
		.audioCodec('libopus')
		.audioBitrate(128)
		.format('webm')
		.outputOptions([
			'-crf 30',
			'-deadline realtime',
			'-cpu-used 2',
			'-threads 3',
		])
		.on('error', function(err) {
			if (process.env.MODE === 'DEV')
				console.log('An error occurred: ' + err.message);
		})
		/*
		.on('end', function() {
			console.log('Processing finished !');
		})*/
		pump(command , res);
}

function fileToStream(req, res, file) {
	let total = file.size;
	let range = req.headers.range; 
	let start = 0;
	let end = total - 1;
	if (file.extension !== 'mp4' && file.extension !== 'webm'
		&& file.extension !== 'ogg')
		return convertAndStream(req, res, file.path, 'file');
	if (!range)
	{
		res.writeHead(200, {
			'Content-Length': total,
			'Content-Type': `video/${file.extension}`
		});
	}
	else
	{
		let pos = range.replace(/bytes=/, "").split("-");
		start = parseInt(pos[0], 10);
		end = pos[1] ? parseInt(pos[1], 10) : total - 1;
		let chunksize = (end - start) + 1;
		res.writeHead(206, {
			"Accept-Ranges": "bytes",
			'Cache-Control': 'no-cache, no-store',
			"Content-Range": `bytes ${start}-${end}/${total}`,
			"Content-Length": chunksize,
			"Content-Type": `video/${file.extension}`
		});
	}
	var stream = fs.createReadStream(file.path, { start: start, end: end })
		.on("open", function() {
			stream.pipe(res);
		}).on("error", function(err) {
			if (process.env.MODE === 'DEV')
				console.log('An error occurred: ' + err);
			res.end();
		});
}

module.exports.watchUrl = watchUrl;
