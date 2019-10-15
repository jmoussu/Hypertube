const fs = require('fs');
const Movie = require('./routes/movie/model.js').Movie;
var CronJob = require('cron').CronJob;

async function deleteOldMovies() {
	let diffDate;
	let now = Date.now();
	let docs = await Movie.find({}).exec();
	docs.forEach(async (e) => {
		for (var file in e.files)
		{
			if (e.files[file].complete)
			{
				diffDate = now - e.files[file].lastview;
				if (diffDate > 2592000)
				{
					deleteFolderRecursive(e.files[file].folder);
					delete e.files[file];
				}
				if (Object.keys(e.files).length === 0)
					await Movie.deleteOne({imdb : e.imdb}).exec();
				else
				{
					e.markModified('files')
					await e.save();
				}
			}
		}
	});
}

function deleteFolderRecursive(path) {
	if (fs.existsSync(path))
	{
		fs.readdirSync(path).forEach(function(file,index){
			var curPath = path + "/" + file;
			if(fs.lstatSync(curPath).isDirectory())
				deleteFolderRecursive(curPath);
			else
				fs.unlinkSync(curPath);
		});
		fs.rmdirSync(path);
	}
};

let job = new CronJob('0 0 1 * * *', () => {
	deleteOldMovies();
	console.log('Checking Database to delete old movies');
});
job.start();
console.log('\x1b[34m', 'Lancement du Cron', '\x1b[0m');
